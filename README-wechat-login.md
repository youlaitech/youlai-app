# 微信登录实现指南

本文档提供基于 wx-java-sdk 的微信授权登录后端实现方案，包括会话管理和接口设计。

## 技术方案概述

微信登录流程采用基于会话管理的方式，避免每次都从微信服务端获取授权：

1. 前端通过微信 SDK 获取登录凭证(code)和手机号加密数据
2. 后端接收凭证和加密数据，与微信服务器交互获取用户信息
3. 后端创建或更新用户信息，并生成会话令牌(token)返回给前端
4. 前端存储令牌，后续请求时携带令牌进行身份验证
5. 令牌过期时，后端自动使用刷新令牌获取新的访问令牌

## 后端依赖

```xml
<!-- wx-java SDK -->
<dependency>
    <groupId>com.github.binarywang</groupId>
    <artifactId>weixin-java-miniapp</artifactId>
    <version>4.5.0</version>
</dependency>

<!-- JWT 依赖 -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

## 后端配置

```yaml
# application.yml
wx:
  miniapp:
    appid: ${WX_MINIAPP_APPID} # 微信小程序 appId
    secret: ${WX_MINIAPP_SECRET} # 微信小程序 appSecret
    token: ${WX_MINIAPP_TOKEN} # 微信小程序消息服务器配置的 token
    aesKey: ${WX_MINIAPP_AES_KEY} # 微信小程序消息服务器配置的 EncodingAESKey
    msgDataFormat: JSON # 消息格式，XML 或者 JSON

# JWT 配置
jwt:
  secret: ${JWT_SECRET_KEY} # JWT 密钥
  access-token-expiration: 86400 # 访问令牌过期时间(秒)，默认1天
  refresh-token-expiration: 604800 # 刷新令牌过期时间(秒)，默认7天
```

## 微信服务配置类

```java
@Configuration
@EnableConfigurationProperties(WxMaProperties.class)
public class WxMaConfiguration {
    private final WxMaProperties properties;
    private static final Map<String, WxMaService> maServices = new HashMap<>();

    @Autowired
    public WxMaConfiguration(WxMaProperties properties) {
        this.properties = properties;
    }

    @Bean
    public WxMaService wxMaService() {
        WxMaService service = new WxMaServiceImpl();
        WxMaDefaultConfigImpl config = new WxMaDefaultConfigImpl();
        config.setAppid(properties.getAppid());
        config.setSecret(properties.getSecret());
        config.setToken(properties.getToken());
        config.setAesKey(properties.getAesKey());
        config.setMsgDataFormat(properties.getMsgDataFormat());
        service.setWxMaConfig(config);
        maServices.put(properties.getAppid(), service);
        return service;
    }

    public static WxMaService getMaService(String appid) {
        return maServices.get(appid);
    }
}
```

## 微信用户表设计

```sql
CREATE TABLE `wx_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `open_id` varchar(128) NOT NULL COMMENT '微信开放ID',
  `union_id` varchar(128) DEFAULT NULL COMMENT '微信开放平台unionid',
  `session_key` varchar(128) DEFAULT NULL COMMENT '会话密钥',
  `nickname` varchar(64) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(256) DEFAULT NULL COMMENT '头像',
  `phone` varchar(32) DEFAULT NULL COMMENT '手机号',
  `gender` tinyint(1) DEFAULT NULL COMMENT '性别(0:未知 1:男 2:女)',
  `country` varchar(64) DEFAULT NULL COMMENT '国家',
  `province` varchar(64) DEFAULT NULL COMMENT '省份',
  `city` varchar(64) DEFAULT NULL COMMENT '城市',
  `language` varchar(64) DEFAULT NULL COMMENT '语言',
  `is_new_user` tinyint(1) DEFAULT '1' COMMENT '是否新用户(0:否 1:是)',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_open_id` (`open_id`),
  KEY `idx_union_id` (`union_id`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信用户表';
```

## 控制器层实现

```java
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final WxMaService wxMaService;
    private final UserService userService;
    private final JwtService jwtService;

    /**
     * 微信登录(简单版)
     */
    @PostMapping("/wechat/login")
    public R<LoginResult> wechatLogin(@RequestBody WechatLoginRequest request) {
        try {
            // 获取微信用户信息
            WxMaJscode2SessionResult sessionResult = wxMaService.jsCode2SessionInfo(request.getCode());
            String openid = sessionResult.getOpenid();
            String sessionKey = sessionResult.getSessionKey();

            // 查询或创建用户
            User user = userService.getOrCreateWxUser(openid, sessionKey);

            // 生成令牌
            String accessToken = jwtService.generateAccessToken(user.getId());
            String refreshToken = jwtService.generateRefreshToken(user.getId());

            // 构建返回结果
            LoginResult result = new LoginResult();
            result.setAccessToken(accessToken);
            result.setRefreshToken(refreshToken);
            result.setTokenType("Bearer");
            result.setExpiresIn(jwtService.getAccessTokenExpiration());
            result.setNewUser(user.getIsNewUser());
            result.setProfileComplete(userService.isUserProfileComplete(user));

            return R.ok(result);
        } catch (WxErrorException e) {
            log.error("微信登录失败", e);
            return R.fail("微信登录失败: " + e.getMessage());
        }
    }

    /**
     * 微信小程序手机号登录
     */
    @PostMapping("/wechat/phone-login")
    public R<LoginResult> wechatPhoneLogin(@RequestBody WechatPhoneLoginRequest request) {
        try {
            // 获取微信用户信息
            WxMaJscode2SessionResult sessionResult = wxMaService.jsCode2SessionInfo(request.getCode());
            String openid = sessionResult.getOpenid();
            String sessionKey = sessionResult.getSessionKey();

            // 解密手机号
            String phoneNumber = null;

            // 新版本获取手机号
            if (request.getPhoneCode() != null) {
                WxMaPhoneNumberInfo phoneInfo = wxMaService.getPhoneNoInfo(request.getPhoneCode());
                phoneNumber = phoneInfo.getPhoneNumber();
            }
            // 旧版本获取手机号
            else if (request.getEncryptedData() != null && request.getIv() != null) {
                WxMaPhoneNumberInfo phoneInfo = wxMaService.getUserService()
                    .getPhoneNoInfo(sessionKey, request.getEncryptedData(), request.getIv());
                phoneNumber = phoneInfo.getPhoneNumber();
            }

            if (phoneNumber == null) {
                return R.fail("获取手机号失败");
            }

            // 查询或创建用户并更新手机号
            User user = userService.getOrCreateWxUserWithPhone(openid, sessionKey, phoneNumber);

            // 生成令牌
            String accessToken = jwtService.generateAccessToken(user.getId());
            String refreshToken = jwtService.generateRefreshToken(user.getId());

            // 构建返回结果
            LoginResult result = new LoginResult();
            result.setAccessToken(accessToken);
            result.setRefreshToken(refreshToken);
            result.setTokenType("Bearer");
            result.setExpiresIn(jwtService.getAccessTokenExpiration());
            result.setNewUser(user.getIsNewUser());
            result.setProfileComplete(userService.isUserProfileComplete(user));

            return R.ok(result);
        } catch (WxErrorException e) {
            log.error("微信手机号登录失败", e);
            return R.fail("微信手机号登录失败: " + e.getMessage());
        }
    }

    /**
     * 检查会话有效性
     */
    @GetMapping("/check-session")
    public R<SessionValidResult> checkSession(HttpServletRequest request) {
        String token = jwtService.getTokenFromRequest(request);
        boolean isValid = jwtService.validateToken(token);

        SessionValidResult result = new SessionValidResult();
        result.setValid(isValid);

        return R.ok(result);
    }

    /**
     * 刷新令牌
     */
    @PostMapping("/refresh-token")
    public R<RefreshTokenResult> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            if (!jwtService.validateRefreshToken(refreshToken)) {
                return R.fail("刷新令牌无效或已过期");
            }

            Long userId = jwtService.getUserIdFromToken(refreshToken);
            String newAccessToken = jwtService.generateAccessToken(userId);

            RefreshTokenResult result = new RefreshTokenResult();
            result.setAccessToken(newAccessToken);
            result.setExpiresIn(jwtService.getAccessTokenExpiration());

            return R.ok(result);
        } catch (Exception e) {
            log.error("刷新令牌失败", e);
            return R.fail("刷新令牌失败");
        }
    }

    /**
     * 登出
     */
    @PostMapping("/logout")
    public R<Void> logout(HttpServletRequest request) {
        // 此处可以将token加入黑名单
        // 在真实场景中，可以将token存入Redis黑名单，并设置过期时间
        return R.ok();
    }
}
```

## JWT服务实现

```java
@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    /**
     * 生成访问令牌
     */
    public String generateAccessToken(Long userId) {
        return generateToken(userId, accessTokenExpiration, "access");
    }

    /**
     * 生成刷新令牌
     */
    public String generateRefreshToken(Long userId) {
        return generateToken(userId, refreshTokenExpiration, "refresh");
    }

    /**
     * 生成令牌
     */
    private String generateToken(Long userId, long expiration, String type) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration * 1000);

        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("type", type)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从请求中获取令牌
     */
    public String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * 验证令牌
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 验证刷新令牌
     */
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 从令牌中获取用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();

        return Long.parseLong(claims.getSubject());
    }

    /**
     * 获取签名密钥
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 获取访问令牌过期时间(秒)
     */
    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}
```

## 用户服务实现

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final WxUserMapper wxUserMapper;

    /**
     * 获取或创建微信用户
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public User getOrCreateWxUser(String openid, String sessionKey) {
        // 查询用户
        WxUser wxUser = wxUserMapper.selectByOpenId(openid);

        // 如果用户不存在，创建新用户
        if (wxUser == null) {
            wxUser = new WxUser();
            wxUser.setOpenId(openid);
            wxUser.setSessionKey(sessionKey);
            wxUser.setIsNewUser(true);
            wxUser.setLastLoginTime(new Date());
            wxUserMapper.insert(wxUser);
        } else {
            // 更新会话密钥和登录时间
            wxUser.setSessionKey(sessionKey);
            wxUser.setLastLoginTime(new Date());
            wxUserMapper.updateById(wxUser);
        }

        // 将 WxUser 转换为 User
        return convertToUser(wxUser);
    }

    /**
     * 获取或创建带手机号的微信用户
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public User getOrCreateWxUserWithPhone(String openid, String sessionKey, String phone) {
        // 先检查是否有该手机号的用户
        WxUser wxUserByPhone = wxUserMapper.selectByPhone(phone);

        // 如果存在该手机号用户但openid不同，可能是用户换了微信号，更新openid
        if (wxUserByPhone != null && !openid.equals(wxUserByPhone.getOpenId())) {
            wxUserByPhone.setOpenId(openid);
            wxUserByPhone.setSessionKey(sessionKey);
            wxUserByPhone.setLastLoginTime(new Date());
            wxUserByPhone.setIsNewUser(false);
            wxUserMapper.updateById(wxUserByPhone);
            return convertToUser(wxUserByPhone);
        }

        // 查询用户
        WxUser wxUser = wxUserMapper.selectByOpenId(openid);

        // 如果用户不存在，创建新用户
        if (wxUser == null) {
            wxUser = new WxUser();
            wxUser.setOpenId(openid);
            wxUser.setSessionKey(sessionKey);
            wxUser.setPhone(phone);
            wxUser.setIsNewUser(true);
            wxUser.setLastLoginTime(new Date());
            wxUserMapper.insert(wxUser);
        } else {
            // 更新会话密钥、手机号和登录时间
            wxUser.setSessionKey(sessionKey);
            wxUser.setPhone(phone);
            wxUser.setLastLoginTime(new Date());
            wxUserMapper.updateById(wxUser);
        }

        // 将 WxUser 转换为 User
        return convertToUser(wxUser);
    }

    /**
     * 判断用户信息是否完整
     */
    @Override
    public boolean isUserProfileComplete(User user) {
        if (user == null) {
            return false;
        }

        return StringUtils.hasText(user.getNickname())
            && StringUtils.hasText(user.getAvatar())
            && StringUtils.hasText(user.getPhone());
    }

    /**
     * 将 WxUser 转换为 User
     */
    private User convertToUser(WxUser wxUser) {
        if (wxUser == null) {
            return null;
        }

        User user = new User();
        user.setId(wxUser.getId());
        user.setOpenId(wxUser.getOpenId());
        user.setUnionId(wxUser.getUnionId());
        user.setNickname(wxUser.getNickname());
        user.setAvatar(wxUser.getAvatarUrl());
        user.setPhone(wxUser.getPhone());
        user.setGender(wxUser.getGender());
        user.setIsNewUser(wxUser.getIsNewUser());

        return user;
    }
}
```

## 网关过滤器实现 (可选)

如果使用了Spring Cloud Gateway，可以添加JWT验证过滤器：

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter {

    private final JwtService jwtService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 白名单路径，不需要token验证
        if (isWhiteListPath(request.getPath().toString())) {
            return chain.filter(exchange);
        }

        // 获取token
        String token = getTokenFromRequest(request);
        if (token == null) {
            return onError(exchange, "未授权", HttpStatus.UNAUTHORIZED);
        }

        // 验证token
        if (!jwtService.validateToken(token)) {
            return onError(exchange, "token无效或已过期", HttpStatus.UNAUTHORIZED);
        }

        // 获取用户ID并设置到请求头
        Long userId = jwtService.getUserIdFromToken(token);
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-ID", userId.toString())
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isWhiteListPath(String path) {
        List<String> whiteList = Arrays.asList(
            "/api/v1/auth/login",
            "/api/v1/auth/wechat/login",
            "/api/v1/auth/wechat/mini-login",
            "/api/v1/auth/wechat/phone-login",
            "/api/v1/auth/refresh-token"
        );

        return whiteList.stream().anyMatch(path::startsWith);
    }

    private String getTokenFromRequest(ServerHttpRequest request) {
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String auth = authHeaders.get(0);
            if (auth.startsWith("Bearer ")) {
                return auth.substring(7);
            }
        }
        return null;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> result = new HashMap<>();
        result.put("code", status.value());
        result.put("message", message);

        byte[] bytes = new ObjectMapper().writeValueAsBytes(result);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
```

## 安全建议

1. 生产环境中使用HTTPS保护API通信
2. 敏感信息(如SessionKey)不要存储在前端
3. 为JWT密钥使用足够强度的随机字符串
4. 实现令牌黑名单机制处理注销和令牌泄露情况
5. 考虑实现令牌自动续期机制
6. 定期清理过期的会话记录
7. 记录关键操作的审计日志

## 测试

使用Postman或其他API测试工具测试以下接口：

1. `/api/v1/auth/wechat/login` - 微信简单登录
2. `/api/v1/auth/wechat/phone-login` - 微信手机号登录
3. `/api/v1/auth/check-session` - 检查会话有效性
4. `/api/v1/auth/refresh-token` - 刷新令牌
5. `/api/v1/auth/logout` - 登出
