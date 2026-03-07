<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1" />
      <view class="bg-circle bg-circle-2" />
    </view>

    <view class="login-nav" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="login-nav__bar" :style="{ height: `${navBarHeight}px` }">
        <view class="login-nav__action" hover-class="login-nav__action--active" @click="handleBack">
          <text class="login-nav__back-icon">‹</text>
        </view>
        <view class="login-nav__title" />
        <view class="login-nav__placeholder" />
      </view>
    </view>

    <!-- 主内容 -->
    <view class="login-main" :style="{ paddingTop: `${statusBarHeight + navBarHeight + 4}px` }">
      <!-- Logo -->
      <view class="login-logo">
        <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
        <text class="logo-text">youlai-app</text>
      </view>

      <!-- 登录卡片 -->
      <view class="login-card">
        <!-- 标题 -->
        <view class="card-header">
          <text class="card-title">欢迎登录</text>
          <text class="card-desc">{{ loginModeDesc }}</text>
        </view>

        <!-- 表单区域 -->
        <view v-if="loginMode !== 'WECHAT'" class="form-area">
          <!-- 用户名/手机号 -->
          <view class="input-box">
            <wd-icon name="person" size="20" color="#9ca3af" />
            <input
              v-model="formData.username"
              class="input-field"
              :placeholder="loginMode === 'PASSWORD' ? '请输入用户名' : '请输入手机号'"
              :maxlength="loginMode === 'PASSWORD' ? 50 : 11"
            />
          </view>

          <!-- 密码 -->
          <view v-if="loginMode === 'PASSWORD'" class="input-box">
            <wd-icon name="lock" size="20" color="#9ca3af" />
            <input
              v-model="formData.password"
              class="input-field"
              :password="!showPassword"
              placeholder="请输入密码"
              :maxlength="50"
              @confirm="handleLogin"
            />
            <view class="input-suffix" @click="showPassword = !showPassword">
              <wd-icon :name="showPassword ? 'eye-open' : 'eye-close'" size="20" color="#9ca3af" />
            </view>
          </view>

          <!-- 图形验证码（密码登录时显示） -->
          <view v-if="loginMode === 'PASSWORD'" class="input-box">
            <wd-icon name="shield" size="20" color="#9ca3af" />
            <input
              v-model="formData.captchaCode"
              class="input-field"
              placeholder="请输入验证码"
              :maxlength="6"
              @confirm="handleLogin"
            />
            <image
              v-if="captchaBase64"
              class="captcha-img"
              :src="captchaBase64"
              mode="aspectFit"
              @click="fetchCaptcha"
            />
          </view>

          <!-- 验证码 -->
          <view v-else class="input-box">
            <wd-icon name="shield" size="20" color="#9ca3af" />
            <input
              v-model="formData.code"
              class="input-field"
              placeholder="请输入验证码"
              type="number"
              :maxlength="6"
              @confirm="handleLogin"
            />
            <view
              class="sms-btn"
              :class="smsCountdown > 0 ? 'sms-btn-disabled' : 'sms-btn-active'"
              @click="handleSendCode"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s` : "获取验证码" }}
            </view>
          </view>

          <!-- 演示环境提示 -->
          <view v-if="loginMode === 'SMS'" class="demo-tip">
            <text class="demo-tip-text">演示环境验证码：123456</text>
          </view>

          <!-- 登录按钮 -->
          <button class="btn-primary" :disabled="loading" @click="handleLogin">
            {{ loading ? "登录中..." : "登 录" }}
          </button>

          <!-- 切换登录方式 -->
          <view class="switch-mode" @click="toggleLoginMode">
            <text class="switch-text">
              {{ loginMode === "PASSWORD" ? "忘记密码？" : "记得密码？" }}
            </text>
            <text class="switch-link">
              {{ loginMode === "PASSWORD" ? "验证码登录" : "密码登录" }}
            </text>
          </view>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <!-- 微信登录区域 -->
        <view v-else class="form-area">
          <!-- 企业一键登录 -->
          <button
            class="btn-wechat"
            open-type="getPhoneNumber"
            @getphonenumber="handleWechatPhoneLogin"
          >
            <image class="btn-wechat-icon" src="/static/images/wechat-icon.png" mode="aspectFit" />
            微信一键登录
          </button>

          <!-- 其他登录方式 -->
          <view class="switch-mode" @click="loginMode = 'PASSWORD'">
            <text class="switch-text">其他登录方式</text>
            <text class="switch-link">账号登录</text>
          </view>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <!-- 分割线 -->
        <view v-if="loginMode !== 'WECHAT'" class="divider">
          <view class="divider-line" />
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line" />
        </view>

        <!-- 微信登录入口 -->
        <view v-if="loginMode !== 'WECHAT'" class="wechat-entry">
          <image
            class="wechat-icon-img"
            src="/static/icons/weixin.png"
            mode="aspectFit"
            @click="loginMode = 'WECHAT'"
          />
        </view>

        <view class="agreement">
          <wd-checkbox v-model="isAgreePolicy" shape="square" size="16px">
            <text class="agreement-text">
              我已阅读并同意
              <text class="agreement-link" @click.stop="navigateToAgreement('user')">
                《用户协议》
              </text>
              与
              <text class="agreement-link" @click.stop="navigateToAgreement('privacy')">
                《隐私政策》
              </text>
            </text>
          </wd-checkbox>
        </view>
        <!-- #endif -->
      </view>
    </view>

    <!-- 绑定手机号弹窗 -->
    <wd-popup
      v-model="showBindMobilePopup"
      position="bottom"
      closable
      custom-style="border-radius: 24rpx 24rpx 0 0;"
      @close="resetBindForm"
    >
      <view class="bind-popup">
        <text class="bind-title">绑定手机号</text>

        <view class="form-area">
          <view class="input-box">
            <wd-icon name="phone" size="20" color="#9ca3af" />
            <input
              v-model="bindMobileForm.mobile"
              class="input-field"
              placeholder="请输入手机号"
              type="number"
              :maxlength="11"
            />
          </view>

          <view class="input-box">
            <wd-icon name="shield" size="20" color="#9ca3af" />
            <input
              v-model="bindMobileForm.code"
              class="input-field"
              placeholder="请输入验证码"
              type="number"
              :maxlength="6"
            />
            <view
              class="sms-btn"
              :class="bindSmsCountdown > 0 ? 'sms-btn-disabled' : 'sms-btn-active'"
              @click="handleSendBindCode"
            >
              {{ bindSmsCountdown > 0 ? `${bindSmsCountdown}s` : "获取验证码" }}
            </view>
          </view>

          <!-- 演示环境提示 -->
          <view class="demo-tip">
            <text class="demo-tip-text">演示环境验证码：123456</text>
          </view>

          <button class="btn-bind" :disabled="bindLoading" @click="handleBindMobile">
            {{ bindLoading ? "绑定中..." : "确认绑定" }}
          </button>
        </view>
      </view>
    </wd-popup>

    <!-- 协议确认弹窗 -->
    <wd-message-box selector="policy-box">
      <view class="text-center text-sm text-gray-500 leading-relaxed">
        请阅读并同意有来技术
        <text class="text-blue-500" @click.stop="navigateToAgreement('user')">《用户协议》</text>
        <text class="text-blue-500" @click.stop="navigateToAgreement('privacy')">《隐私政策》</text>
      </view>
    </wd-message-box>

    <wd-toast />
  </view>
</template>

<route lang="json">
{
  "name": "login",
  "style": { "navigationStyle": "custom", "navigationBarTitleText": "" }
}
</route>

<script lang="ts" setup>
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { useToast, useMessage } from "wot-design-uni";
import { useUserStore } from "@/store/modules/user";
import AuthAPI from "@/api/auth";

const statusBarHeight = ref(20);
const navBarHeight = ref(44);

const toast = useToast();
const message = useMessage("policy-box");
const userStore = useUserStore();

// 状态
const loading = ref(false);
const showPassword = ref(false);
const isAgreePolicy = ref(false);
const loginMode = ref<"PASSWORD" | "SMS" | "WECHAT">("PASSWORD");
const smsCountdown = ref(0);
const smsTimer = ref<ReturnType<typeof setInterval> | null>(null);

const formData = ref({
  username: "admin",
  password: "123456",
  code: "123456",
  captchaCode: "",
});

// 图形验证码
const captchaId = ref("");
const captchaBase64 = ref("");
const captchaLoading = ref(false);

const redirect = ref("/pages/index/index");

// 绑定手机号相关
const showBindMobilePopup = ref(false);
const bindLoading = ref(false);
const bindSmsCountdown = ref(0);
const bindSmsTimer = ref<ReturnType<typeof setInterval> | null>(null);
const wechatOpenid = ref("");

const bindMobileForm = ref({
  mobile: "",
  code: "",
});

const pendingLoginAction = ref<"FORM" | "WECHAT_PHONE" | null>(null);
const pendingWechatPhoneCode = ref<string>("");

// 获取图形验证码
const fetchCaptcha = async () => {
  if (captchaLoading.value) return;
  try {
    captchaLoading.value = true;
    captchaBase64.value = "";
    const res = await AuthAPI.getCaptcha();
    captchaId.value = res.captchaId;
    captchaBase64.value = res.captchaBase64;
  } catch (e) {
    console.error("获取验证码失败", e);
  } finally {
    captchaLoading.value = false;
  }
};

// 计算属性
const loginModeDesc = computed(() => {
  const modeMap = {
    PASSWORD: "使用账号密码登录",
    SMS: "使用手机验证码登录",
    WECHAT: "使用微信快捷登录",
  };
  return modeMap[loginMode.value];
});

const isValidMobile = (mobile: string) => /^1\d{10}$/.test((mobile || "").trim());

const canSubmit = computed(() => {
  if (loginMode.value === "PASSWORD") {
    return (formData.value.username || "").trim() && (formData.value.password || "").trim();
  }
  if (loginMode.value === "SMS") {
    return isValidMobile(formData.value.username) && (formData.value.code || "").trim();
  }
  return false;
});

// 生命周期
onLoad((options: any) => {
  const fromQuery = options?.redirect ? decodeURIComponent(options.redirect) : "";
  if (fromQuery && fromQuery !== "/pages/login/index") {
    redirect.value = fromQuery;
  }

  uni.setNavigationBarTitle({ title: "" });

  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;
  navBarHeight.value = 44;

  // #ifdef MP-WEIXIN
  const menuButton = uni.getMenuButtonBoundingClientRect();
  navBarHeight.value = menuButton.height + (menuButton.top - statusBarHeight.value) * 2;
  // #endif

  // #ifndef MP-WEIXIN
  // 非微信环境强制使用密码登录
  if (loginMode.value === "WECHAT") {
    loginMode.value = "PASSWORD";
  }
  // #endif
  // 获取图形验证码
  fetchCaptcha();
});

onShow(() => {
  uni.setNavigationBarTitle({ title: "" });
});

onUnload(() => {
  if (smsTimer.value) clearInterval(smsTimer.value);
  if (bindSmsTimer.value) clearInterval(bindSmsTimer.value);
});

// 方法
const toggleLoginMode = () => {
  if (loginMode.value === "PASSWORD") {
    loginMode.value = "SMS";
    formData.value.username = "18812345678";
    formData.value.password = "";
    formData.value.code = "";
  } else {
    loginMode.value = "PASSWORD";
    formData.value.username = "admin";
    formData.value.password = "123456";
    formData.value.code = "";
    formData.value.captchaCode = "";
    fetchCaptcha();
  }
};

const openPolicyDialog = (action: "FORM" | "WECHAT_PHONE", phoneCode: string = "") => {
  pendingLoginAction.value = action;
  pendingWechatPhoneCode.value = phoneCode;

  message
    .confirm({ title: "提示" })
    .then(async () => {
      isAgreePolicy.value = true;
      const act = pendingLoginAction.value;
      const code = pendingWechatPhoneCode.value;
      pendingLoginAction.value = null;
      pendingWechatPhoneCode.value = "";

      if (act === "WECHAT_PHONE") {
        await doWechatPhoneLogin(code);
      } else if (act === "FORM") {
        await doFormLogin();
      }
    })
    .catch(() => {
      pendingLoginAction.value = null;
      pendingWechatPhoneCode.value = "";
    });
};

async function doFormLogin() {
  if (!canSubmit.value) {
    if (loginMode.value === "PASSWORD") {
      toast.error("请输入用户名和密码");
    } else if (loginMode.value === "SMS") {
      toast.error("请输入正确的手机号和验证码");
    }
    return;
  }

  if (loading.value) return;

  loading.value = true;

  try {
    if (loginMode.value === "PASSWORD") {
      await userStore.login({
        username: formData.value.username,
        password: formData.value.password,
        captchaId: captchaId.value,
        captchaCode: formData.value.captchaCode,
      });
    } else {
      await userStore.loginBySms({
        mobile: formData.value.username.trim(),
        code: formData.value.code,
      });
    }

    await userStore.getInfo();
    toast.success("登录成功");
    setTimeout(() => uni.reLaunch({ url: redirect.value }), 800);
  } catch (error: any) {
    toast.error(error?.message || "登录失败");
    // 登录失败刷新验证码
    if (loginMode.value === "PASSWORD") {
      fetchCaptcha();
    }
  } finally {
    loading.value = false;
  }
}

const handleLogin = async () => {
  if (!isAgreePolicy.value) {
    openPolicyDialog("FORM");
    return;
  }
  await doFormLogin();
};

const handleSendCode = async () => {
  if (smsCountdown.value > 0) return;
  const mobile = formData.value.username.trim();
  if (!mobile) {
    toast.error("请输入手机号");
    return;
  }
  if (!isValidMobile(mobile)) {
    toast.error("请输入正确的手机号");
    return;
  }

  try {
    await AuthAPI.sendSmsLoginCode(mobile);
    toast.success("验证码已发送");
    startSmsCountdown(smsCountdown, smsTimer);
  } catch (error: any) {
    toast.error(error?.message || "发送失败");
  }
};

const startSmsCountdown = (
  countdown: Ref<number>,
  timer: Ref<ReturnType<typeof setInterval> | null>
) => {
  countdown.value = 60;
  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      countdown.value = 0;
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    }
  }, 1000);
};

// 微信登录
const handleWechatPhoneLogin = async (e: any) => {
  const phoneCode = e.detail.code;
  if (!isAgreePolicy.value) {
    openPolicyDialog("WECHAT_PHONE", phoneCode);
    return;
  }
  if (!phoneCode) {
    // 用户拒绝授权，尝试个人小程序登录
    await handleWechatSilentLogin();
    return;
  }
  await doWechatPhoneLogin(phoneCode);
};

async function doWechatPhoneLogin(phoneCode: string) {
  if (!phoneCode) {
    await handleWechatSilentLogin();
    return;
  }

  loading.value = true;

  try {
    const { code: loginCode } = await uni.login();
    await userStore.loginByWechatMiniappPhone({ loginCode, phoneCode });
    await userStore.getInfo();
    toast.success("登录成功");
    setTimeout(() => uni.reLaunch({ url: redirect.value }), 800);
  } catch {
    toast.info("正在尝试其他登录方式...");
    await handleWechatSilentLogin();
  } finally {
    loading.value = false;
  }
}

const handleWechatSilentLogin = async () => {
  loading.value = true;
  try {
    const { code } = await uni.login();
    const result: any = await userStore.loginByWechatMiniapp(code);

    if (result.needBindMobile && result.openid) {
      wechatOpenid.value = result.openid;
      showBindMobilePopup.value = true;
    } else if (result.accessToken) {
      await userStore.getInfo();
      toast.success("登录成功");
      setTimeout(() => uni.reLaunch({ url: redirect.value }), 800);
    }
  } catch (error: any) {
    toast.error(error?.message || "微信登录失败");
  } finally {
    loading.value = false;
  }
};

const handleSendBindCode = async () => {
  if (bindSmsCountdown.value > 0) return;
  const mobile = bindMobileForm.value.mobile.trim();
  if (!isValidMobile(mobile)) {
    toast.error("请输入正确的手机号");
    return;
  }

  try {
    await AuthAPI.sendSmsLoginCode(mobile);
    toast.success("验证码已发送");
    startSmsCountdown(bindSmsCountdown, bindSmsTimer);
  } catch (error: any) {
    toast.error(error?.message || "发送失败");
  }
};

const resetBindForm = () => {
  bindMobileForm.value = { mobile: "", code: "" };
  bindSmsCountdown.value = 0;
  if (bindSmsTimer.value) {
    clearInterval(bindSmsTimer.value);
    bindSmsTimer.value = null;
  }
};

const handleBindMobile = async () => {
  if (bindLoading.value) return;
  const { mobile, code } = bindMobileForm.value;
  if (!isValidMobile(mobile)) {
    toast.error("请输入正确的手机号");
    return;
  }
  if (!code.trim()) {
    toast.error("请输入验证码");
    return;
  }

  bindLoading.value = true;

  try {
    await userStore.bindMobileForWechatMiniapp({
      openid: wechatOpenid.value,
      mobile,
      smsCode: code,
    });
    await userStore.getInfo();
    showBindMobilePopup.value = false;
    resetBindForm();
    toast.success("绑定成功");
    setTimeout(() => uni.reLaunch({ url: redirect.value }), 800);
  } catch (error: any) {
    toast.error(error?.message || "绑定失败");
  } finally {
    bindLoading.value = false;
  }
};

const navigateToAgreement = (type: string) => {
  const url =
    type === "user" ? "/pages/mine/settings/agreement/index" : "/pages/mine/settings/privacy/index";
  uni.navigateTo({ url });
};

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.reLaunch({ url: "/pages/index/index" });
};
</script>

<style lang="scss" scoped>
// 页面容器
.login-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #fff 50%, #dbeafe 100%);
}

// 暗黑模式
:global(.dark) .login-page {
  background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%);
}

// 背景装饰
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  filter: blur(64px);
  border-radius: 50%;
}

.bg-circle-1 {
  top: -80px;
  left: -80px;
  width: 240px;
  height: 240px;
  background-color: rgba(96, 165, 250, 0.2);
}

.bg-circle-2 {
  right: -80px;
  bottom: -80px;
  width: 320px;
  height: 320px;
  background-color: rgba(59, 130, 246, 0.15);
}

.login-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 11;
  padding-right: 16px;
  padding-left: 16px;
}

.login-nav__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-nav__action,
.login-nav__placeholder {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  transform: translateY(-50%);
}

.login-nav__action {
  left: 0;
  background-color: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}

.login-nav__action--active {
  opacity: 0.8;
}

.login-nav__placeholder {
  right: 0;
}

.login-nav__back-icon {
  margin-top: -4rpx;
  font-size: 44rpx;
  font-weight: 500;
  line-height: 1;
  color: rgba(15, 23, 42, 0.92);
}

.login-nav__title {
  font-size: 32rpx;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.92);
  letter-spacing: 0.08em;
}

// 主内容
.login-main {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 48px;
  padding-left: 48px;
}

// Logo
.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 36px;
}

.logo-image {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.05em;
}

:global(.dark) .logo-text {
  color: #f3f4f6;
}

// 登录卡片
.login-card {
  width: 100%;
  padding: 32px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

:global(.dark) .login-card {
  background-color: rgba(31, 41, 55, 0.95);
}

// 卡片头部
.card-header {
  margin-bottom: 32px;
  text-align: center;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

:global(.dark) .card-title {
  color: #fff;
}

.card-desc {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

:global(.dark) .card-desc {
  color: #9ca3af;
}

// 表单区域
.form-area {
  > view,
  > button {
    &:not(:first-child) {
      margin-top: 16px;
    }
  }
}

// 输入框容器
.input-box {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  background-color: #f9fafb;
  border-radius: 12px;

  &:focus-within {
    box-shadow: 0 0 0 2px #3b82f6;
  }
}

:global(.dark) .input-box {
  background-color: #374151;
}

.input-field {
  flex: 1;
  height: 100%;
  margin-left: 12px;
  font-size: 14px;
  color: #1f2937;
}

:global(.dark) .input-field {
  color: #f3f4f6;
}

.input-suffix {
  padding: 8px;
}

// 主按钮
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(to right, #3b82f6, #1d4ed8);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    box-shadow: none;
    opacity: 0.5;
  }
}

// 微信按钮
.btn-wechat {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #22c55e;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3);

  &:active {
    transform: scale(0.98);
  }
}

.btn-wechat-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

// 绑定按钮
.btn-bind {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #3b82f6;
  border-radius: 12px;

  &:disabled {
    opacity: 0.5;
  }
}

// 验证码按钮
.sms-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.sms-btn-active {
  color: #2563eb;
  background-color: #eff6ff;
}

.sms-btn-disabled {
  color: #9ca3af;
  background-color: #e5e7eb;
}

.captcha-img {
  width: 100px;
  height: 36px;
  border-radius: 6px;
}

:global(.dark) .sms-btn-active {
  background-color: rgba(30, 58, 138, 0.3);
}

:global(.dark) .sms-btn-disabled {
  background-color: #4b5563;
}

// 切换登录方式
.switch-mode {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.switch-text {
  font-size: 14px;
  color: #6b7280;
}

:global(.dark) .switch-text {
  color: #9ca3af;
}

.switch-link {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  border-bottom: 1px solid #2563eb;
}

:global(.dark) .switch-link {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}

// 分割线
.divider {
  display: flex;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 24px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

:global(.dark) .divider-line {
  background-color: #374151;
}

.divider-text {
  padding: 0 16px;
  font-size: 12px;
  color: #9ca3af;
}

// 微信登录入口
.wechat-entry {
  display: flex;
  gap: 32px;
  justify-content: center;
}

.wechat-icon-img {
  width: 40px;
  height: 40px;

  &:active {
    transform: scale(0.95);
  }
}

.agreement {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 16px;
  margin-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.agreement-text {
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}

.agreement-link {
  color: #2563eb;
}

// 绑定手机号弹窗
.bind-popup {
  padding: 24px;
}

.bind-title {
  display: block;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

:global(.dark) .bind-title {
  color: #fff;
}

// 演示环境提示
.demo-tip {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.demo-tip-text {
  padding: 4px 12px;
  font-size: 12px;
  color: #f59e0b;
  background-color: #fef3c7;
  border-radius: 4px;
}

:global(.dark) .demo-tip-text {
  color: #fbbf24;
  background-color: rgba(251, 191, 36, 0.1);
}

// 暗黑模式适配
:deep(.wd-checkbox__label) {
  display: flex;
  flex-wrap: wrap;
}

:deep(.wd-popup__close) {
  top: 16px;
  right: 16px;
}
</style>
