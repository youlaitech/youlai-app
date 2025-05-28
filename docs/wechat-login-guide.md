# 微信小程序手机授权登录功能指南

## 功能概述

本项目实现了完整的微信小程序手机授权登录功能，包括：

- 微信登录授权
- 手机号获取授权
- 头像昵称填写（使用微信小程序新能力）
- 用户信息完善流程
- 登录状态管理

## 功能特性

### 1. 微信登录流程

- **基础微信登录**：使用 `uni.login()` 获取 code，调用后端接口完成登录
- **增强微信登录**：支持更多用户信息和手机号一次性授权
- **登录状态检查**：自动检查用户信息完整性，引导用户完善信息

### 2. 手机号授权

- **一键授权**：使用微信小程序 `getPhoneNumber` 能力
- **安全获取**：通过后端接口解密获取真实手机号
- **状态显示**：显示脱敏手机号，支持重新授权

### 3. 头像昵称填写

- **微信新能力**：使用 `chooseAvatar` 和 `type="nickname"` 输入框
- **自动上传**：头像选择后自动上传到服务器
- **实时预览**：支持头像实时预览和昵称输入

### 4. 用户信息完善

- **智能引导**：登录后自动检查信息完整性
- **分步填写**：头像、昵称、性别、手机号分步骤完善
- **跳过机制**：允许用户暂时跳过，但会提示影响功能使用

## 文件结构

```
src/
├── pages/
│   └── login/
│       ├── index.vue                 # 登录页面
│       └── complete-profile.vue      # 完善信息页面
├── components/
│   └── WechatProfile.vue            # 微信头像昵称组件
├── api/
│   ├── auth.ts                      # 认证API
│   ├── user.ts                      # 用户API
│   └── file.ts                      # 文件上传API
├── store/
│   └── modules/
│       └── user.ts                  # 用户状态管理
└── utils/
    ├── auth.ts                      # 认证工具函数
    └── storage.ts                   # 存储工具函数
```

## 核心组件说明

### 1. 登录页面 (`pages/login/index.vue`)

**主要功能：**

- 用户名密码登录
- 微信一键登录
- 登录状态检查和跳转

**关键代码：**

```typescript
// 微信登录处理
const handleWechatLogin = async () => {
  const { code } = await uni.login({ provider: "weixin" });

  // 尝试增强登录
  try {
    const result = await userStore.loginByWechatMini({ code });
    // 检查信息完整性
    if (result.isNewUser || !result.isProfileComplete) {
      // 跳转到完善信息页面
      uni.navigateTo({
        url: `/pages/login/complete-profile?redirect=${redirect}`,
      });
    }
  } catch (error) {
    // 回退到基础登录
    await userStore.loginByWechat(code);
  }
};
```

### 2. 完善信息页面 (`pages/login/complete-profile.vue`)

**主要功能：**

- 头像上传（支持微信新能力）
- 昵称输入
- 性别选择
- 手机号授权
- 信息提交和验证

**关键代码：**

```typescript
// 手机号授权
const onGetPhoneNumber = async (e: any) => {
  if (e.detail.errMsg === "getPhoneNumber:ok") {
    const phoneData = await UserAPI.getPhoneNumber({
      code: e.detail.code,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    });
    profileForm.mobile = phoneData.phoneNumber;
  }
};
```

### 3. 微信头像昵称组件 (`components/WechatProfile.vue`)

**主要功能：**

- 使用微信小程序头像选择能力
- 昵称输入框（type="nickname"）
- 性别选择
- 数据双向绑定

**关键代码：**

```vue
<!-- 头像选择 -->
<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
  <image v-if="avatar" :src="avatar" />
</button>

<!-- 昵称输入 -->
<input v-model="nickname" type="nickname" placeholder="请输入昵称" />
```

## API 接口说明

### 1. 认证相关接口

```typescript
// 基础微信登录
AuthAPI.wechatLogin(code: string): Promise<LoginResult>

// 增强微信登录
AuthAPI.wechatMiniLogin(data: WechatMiniLoginData): Promise<WechatLoginResult>
```

### 2. 用户相关接口

```typescript
// 获取微信手机号
UserAPI.getPhoneNumber(data: WechatPhoneData): Promise<PhoneNumberResult>

// 绑定手机号
UserAPI.bindMobile(data: MobileBindingForm): Promise<void>

// 更新用户信息
UserAPI.updateProfile(data: UserProfileForm): Promise<void>
```

### 3. 文件上传接口

```typescript
// 上传文件
FileAPI.upload(filePath: string): Promise<FileInfo>
```

## 类型定义

### 微信登录相关

```typescript
interface WechatMiniLoginData {
  code: string;
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
  };
  phoneData?: {
    code: string;
    encryptedData?: string;
    iv?: string;
  };
}

interface WechatLoginResult extends LoginResult {
  isNewUser?: boolean;
  isProfileComplete?: boolean;
  userInfo?: {
    userId?: number;
    username?: string;
    nickname?: string;
    avatar?: string;
    mobile?: string;
  };
}
```

### 手机号授权相关

```typescript
interface WechatPhoneData {
  code: string;
  encryptedData?: string;
  iv?: string;
}

interface PhoneNumberResult {
  phoneNumber: string;
  purePhoneNumber?: string;
  countryCode?: string;
}
```

## 使用流程

### 1. 用户首次登录

1. 用户点击微信登录按钮
2. 调用 `uni.login()` 获取微信 code
3. 调用后端登录接口，获取 token
4. 检查用户信息完整性
5. 如果信息不完整，跳转到完善信息页面

### 2. 完善用户信息

1. 用户进入完善信息页面
2. 选择头像（使用微信新能力或传统上传）
3. 输入昵称（使用 type="nickname" 输入框）
4. 选择性别
5. 授权获取手机号
6. 提交信息，更新用户资料

### 3. 后续登录

1. 用户再次登录时，检查信息完整性
2. 如果信息完整，直接跳转到主页
3. 如果信息不完整，引导用户完善

## 配置要求

### 1. 微信小程序配置

在 `manifest.json` 中配置：

```json
{
  "mp-weixin": {
    "appid": "your-appid",
    "setting": {
      "urlCheck": false
    },
    "permission": {
      "scope.userInfo": {
        "desc": "用于完善用户资料"
      }
    }
  }
}
```

### 2. 后端接口要求

- 支持微信登录 code 解析
- 支持微信手机号解密
- 支持文件上传
- 支持用户信息更新

## 注意事项

### 1. 微信小程序新能力

- `chooseAvatar` 和 `type="nickname"` 需要微信基础库 2.21.2+
- 需要在微信开发者工具中测试
- 真机调试时需要注意兼容性

### 2. 手机号授权

- 需要微信小程序认证
- 需要在微信公众平台配置服务器域名
- 手机号解密需要在后端完成

### 3. 用户体验

- 提供跳过机制，避免强制完善信息
- 显示脱敏手机号，保护用户隐私
- 支持重新授权和修改信息

## 扩展功能

### 1. 社交登录

可以扩展支持其他社交平台登录：

- QQ 登录
- 支付宝登录
- 苹果登录

### 2. 实名认证

可以添加实名认证功能：

- 身份证验证
- 人脸识别
- 银行卡验证

### 3. 多端同步

可以实现多端登录状态同步：

- H5 端登录
- APP 端登录
- 小程序端登录

## 故障排除

### 1. 微信登录失败

- 检查 appid 配置
- 检查服务器域名配置
- 检查网络连接

### 2. 手机号授权失败

- 检查小程序是否已认证
- 检查后端解密接口
- 检查用户授权状态

### 3. 头像上传失败

- 检查文件上传接口
- 检查文件大小限制
- 检查网络状态

## 总结
