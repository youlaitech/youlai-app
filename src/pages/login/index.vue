<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1" />
      <view class="bg-circle bg-circle-2" />
    </view>

    <!-- 主内容 -->
    <view class="login-main">
      <!-- Logo -->
      <view class="login-logo">
        <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
        <text class="logo-text">YouLai Admin</text>
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
              maxlength="50"
              @confirm="handleLogin"
            />
            <view class="input-suffix" @click="showPassword = !showPassword">
              <wd-icon :name="showPassword ? 'eye-open' : 'eye-close'" size="20" color="#9ca3af" />
            </view>
          </view>

          <!-- 验证码 -->
          <view v-else class="input-box">
            <wd-icon name="shield" size="20" color="#9ca3af" />
            <input
              v-model="formData.code"
              class="input-field"
              placeholder="请输入验证码"
              type="number"
              maxlength="6"
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

          <!-- 登录按钮 -->
          <button class="btn-primary" :disabled="loading || !canSubmit" @click="handleLogin">
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

        <!-- #ifdef MP-WECHAT -->
        <!-- 微信登录区域 -->
        <view v-else class="form-area">
          <!-- 企业一键登录 -->
          <button
            class="btn-wechat"
            open-type="getPhoneNumber"
            @getphonenumber="handleWechatPhoneLogin"
          >
            <wd-icon name="wechat" size="20" color="#fff" class="mr-2" />
            微信一键登录
          </button>

          <!-- 其他登录方式 -->
          <view class="switch-mode" @click="loginMode = 'PASSWORD'">
            <text class="switch-text">其他登录方式</text>
            <text class="switch-link">账号登录</text>
          </view>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WECHAT -->
        <!-- 分割线 -->
        <view v-if="loginMode !== 'WECHAT'" class="divider">
          <view class="divider-line" />
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line" />
        </view>

        <!-- 微信登录入口 -->
        <view v-if="loginMode !== 'WECHAT'" class="wechat-entry">
          <view class="wechat-icon" @click="loginMode = 'WECHAT'">
            <wd-icon name="wechat" size="24" color="#fff" />
          </view>
        </view>
        <!-- #endif -->

        <!-- 协议 -->
        <view class="agreement">
          <wd-checkbox v-model="isAgreePolicy" shape="square" size="16px">
            <text class="agreement-text">
              登录即代表同意
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
              maxlength="11"
            />
          </view>

          <view class="input-box">
            <wd-icon name="shield" size="20" color="#9ca3af" />
            <input
              v-model="bindMobileForm.code"
              class="input-field"
              placeholder="请输入验证码"
              type="number"
              maxlength="6"
            />
            <view
              class="sms-btn"
              :class="bindSmsCountdown > 0 ? 'sms-btn-disabled' : 'sms-btn-active'"
              @click="handleSendBindCode"
            >
              {{ bindSmsCountdown > 0 ? `${bindSmsCountdown}s` : "获取验证码" }}
            </view>
          </view>

          <button class="btn-bind" :disabled="bindLoading" @click="handleBindMobile">
            {{ bindLoading ? "绑定中..." : "确认绑定" }}
          </button>
        </view>
      </view>
    </wd-popup>

    <wd-toast />
  </view>
</template>

<route lang="json">
{
  "name": "login",
  "style": { "navigationStyle": "custom" }
}
</route>

<script lang="ts" setup>
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { useToast } from "wot-design-uni";
import { useUserStore } from "@/store/modules/user-store";
import AuthAPI from "@/api/auth";

const toast = useToast();
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
  code: "1234",
});

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
  if (!isAgreePolicy.value) return false;
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
  // #ifndef MP-WECHAT
  // 非微信环境强制使用密码登录
  if (loginMode.value === "WECHAT") {
    loginMode.value = "PASSWORD";
  }
  // #endif
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
  } else {
    loginMode.value = "PASSWORD";
    formData.value.username = "admin";
  }
  formData.value.code = "";
};

const handleLogin = async () => {
  if (loading.value || !canSubmit.value) return;
  if (!isAgreePolicy.value) {
    toast.error("请先同意用户协议");
    return;
  }

  loading.value = true;

  try {
    if (loginMode.value === "PASSWORD") {
      await userStore.login({
        username: formData.value.username,
        password: formData.value.password,
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
  } finally {
    loading.value = false;
  }
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
  if (!isAgreePolicy.value) {
    toast.error("请先同意用户协议");
    return;
  }

  const phoneCode = e.detail.code;
  if (!phoneCode) {
    // 用户拒绝授权，尝试个人小程序登录
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
  } catch (error: any) {
    // 企业登录失败，尝试个人小程序登录
    toast.info("正在尝试其他登录方式...");
    await handleWechatSilentLogin();
  } finally {
    loading.value = false;
  }
};

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
      code,
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
</script>

<style lang="scss" scoped>
// 页面容器
.login-page {
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
  border-radius: 50%;
  filter: blur(64px);
}

.bg-circle-1 {
  top: -80px;
  left: -80px;
  width: 240px;
  height: 240px;
  background-color: rgba(96, 165, 250, 0.2);
}

.bg-circle-2 {
  bottom: -80px;
  right: -80px;
  width: 320px;
  height: 320px;
  background-color: rgba(59, 130, 246, 0.15);
}

// 主内容
.login-main {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160px 48px 0;
}

// Logo
.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
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
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(24px);
}

:global(.dark) .login-card {
  background-color: rgba(31, 41, 55, 0.95);
}

// 卡片头部
.card-header {
  text-align: center;
  margin-bottom: 32px;
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
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

:global(.dark) .card-desc {
  color: #9ca3af;
}

// 表单区域
.form-area {
  & > view + view {
    margin-top: 16px;
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
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
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
    opacity: 0.5;
    box-shadow: none;
  }
}

// 微信按钮
.btn-wechat {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
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

// 绑定按钮
.btn-bind {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  height: 32px;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  margin-left: 4px;
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
  justify-content: center;
  gap: 32px;
}

.wechat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);

  &:active {
    transform: scale(0.95);
  }
}

// 协议
.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

:global(.dark) .agreement {
  border-top-color: #374151;
}

.agreement-text {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

:global(.dark) .agreement-text {
  color: #9ca3af;
}

.agreement-link {
  color: #2563eb;
}

:global(.dark) .agreement-link {
  color: #60a5fa;
}

// 绑定手机号弹窗
.bind-popup {
  padding: 24px;
}

.bind-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 24px;
}

:global(.dark) .bind-title {
  color: #fff;
}

// 暗黑模式适配
:deep(.wd-checkbox__label) {
  display: flex;
  flex-wrap: wrap;
}

:deep(.wd-popup__close) {
  right: 16px;
  top: 16px;
}
</style>
