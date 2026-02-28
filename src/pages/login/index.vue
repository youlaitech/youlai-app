<template>
  <view class="login-page" :style="pageStyle">
    <!-- 背景 -->
    <view class="login-page__bg"></view>

    <!-- 主内容 -->
    <view class="login-content">
      <!-- Logo -->
      <view class="login-logo">
        <image class="login-logo__img" src="/static/logo.png" mode="aspectFit" />
        <text class="login-logo__name">YouLai Admin</text>
      </view>

      <!-- 登录卡片 -->
      <view class="login-card">
        <!-- 标题 -->
        <view class="login-card__header">
          <text class="login-card__title">欢迎登录</text>
          <text class="login-card__desc">{{ loginMode === 'PASSWORD' ? '使用账号密码登录' : '使用手机验证码登录' }}</text>
        </view>

        <!-- 表单 -->
        <view class="login-form">
          <!-- 用户名/手机号 -->
          <view class="login-field">
            <view class="login-field__icon">
              <wd-icon name="person" size="20" color="#9ca3af" />
            </view>
            <input
              v-model="formData.username"
              class="login-field__input"
              :placeholder="loginMode === 'PASSWORD' ? '请输入用户名' : '请输入手机号'"
              placeholder-class="login-field__placeholder"
              :maxlength="loginMode === 'PASSWORD' ? 50 : 11"
            />
          </view>

          <!-- 密码 -->
          <view v-if="loginMode === 'PASSWORD'" class="login-field">
            <view class="login-field__icon">
              <wd-icon name="lock" size="20" color="#9ca3af" />
            </view>
            <input
              v-model="formData.password"
              class="login-field__input"
              :password="!showPassword"
              placeholder="请输入密码"
              placeholder-class="login-field__placeholder"
              maxlength="50"
              @confirm="handleLogin"
            />
            <view class="login-field__toggle" @click="showPassword = !showPassword">
              <wd-icon :name="showPassword ? 'eye-open' : 'eye-close'" size="20" color="#9ca3af" />
            </view>
          </view>

          <!-- 验证码 -->
          <view v-else class="login-field login-field--code">
            <view class="login-field__icon">
              <wd-icon name="shield" size="20" color="#9ca3af" />
            </view>
            <input
              v-model="formData.code"
              class="login-field__input"
              placeholder="请输入验证码"
              placeholder-class="login-field__placeholder"
              type="number"
              maxlength="6"
              @confirm="handleLogin"
            />
            <view class="login-field__code-btn" :class="{ 'is-disabled': smsCountdown > 0 }" @click="handleSendCode">
              <text>{{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}</text>
            </view>
          </view>

          <!-- 登录按钮 -->
          <button class="login-submit" :class="{ 'is-disabled': !canSubmit }" :disabled="loading || !canSubmit" @click="handleLogin">
            <text v-if="loading">登录中...</text>
            <text v-else>登 录</text>
          </button>

          <!-- 切换登录方式 -->
          <view class="login-switch" @click="toggleLoginMode">
            <text class="login-switch__prefix">{{ loginMode === 'PASSWORD' ? '忘记密码？' : '记得密码？' }}</text>
            <text class="login-switch__link">{{ loginMode === 'PASSWORD' ? '使用验证码登录' : '使用密码登录' }}</text>
          </view>
        </view>

        <!-- 协议 -->
        <view class="login-agreement">
          <wd-checkbox v-model="isAgreePolicy" shape="square" size="16px">
            <text class="login-agreement__text">
              登录即代表同意
              <text class="login-agreement__link" @click.stop="navigateToAgreement('user')">《用户协议》</text>
              与
              <text class="login-agreement__link" @click.stop="navigateToAgreement('privacy')">《隐私政策》</text>
            </text>
          </wd-checkbox>
        </view>
      </view>
    </view>

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
import AuthAPI, { type LoginData } from "@/api/auth";
import { useUserStore } from "@/store/modules/user-store";
import { useToast } from "wot-design-uni";

const toast = useToast();
const loading = ref(false);
const userStore = useUserStore();
const showPassword = ref(false);
const isAgreePolicy = ref(false);
const loginMode = ref<"PASSWORD" | "SMS">("PASSWORD");
const smsCountdown = ref(0);
const smsTimer = ref<ReturnType<typeof setInterval> | null>(null);

const keyboardHeight = ref(0);
const pageStyle = computed(() => {
  return keyboardHeight.value > 0 ? { paddingBottom: `${keyboardHeight.value}px` } : {};
});

const formData = ref({
  username: "admin",
  password: "123456",
  code: "1234",
});

const redirect = ref("/pages/index/index");

onLoad((options: any) => {
  const fromQuery = options && options.redirect ? decodeURIComponent(options.redirect) : "";
  if (fromQuery && fromQuery !== "/pages/login/index") {
    redirect.value = fromQuery;
  }
  uni.onKeyboardHeightChange((res) => {
    keyboardHeight.value = res.height || 0;
  });
});

onUnload(() => {
  if (smsTimer.value) {
    clearInterval(smsTimer.value);
    smsTimer.value = null;
  }
});

const isValidMobile = (mobile: string) => /^1\d{10}$/.test((mobile || "").trim());

const canSubmit = computed(() => {
  if (!isAgreePolicy.value) return false;
  if (loginMode.value === 'PASSWORD') {
    return (formData.value.username || "").trim() && (formData.value.password || "").trim();
  }
  return isValidMobile(formData.value.username) && (formData.value.code || "").trim();
});

const toggleLoginMode = () => {
  loginMode.value = loginMode.value === 'PASSWORD' ? 'SMS' : 'PASSWORD';
  formData.value.code = '';
  // 切换模式时更新默认用户名
  formData.value.username = loginMode.value === 'PASSWORD' ? 'admin' : '18812345678';
};

const handleLogin = () => {
  if (loading.value || !canSubmit.value) return;
  if (!isAgreePolicy.value) {
    toast.error("请先同意用户协议");
    return;
  }

  loading.value = true;

  if (loginMode.value === 'PASSWORD') {
    userStore
      .login({ username: formData.value.username, password: formData.value.password })
      .then(() => userStore.getInfo())
      .then(() => {
        toast.success("登录成功");
        setTimeout(() => { uni.reLaunch({ url: redirect.value }); }, 800);
      })
      .catch((error: any) => { toast.error(error?.message || "登录失败"); })
      .finally(() => { loading.value = false; });
  } else {
    const mobile = formData.value.username.trim();
    userStore
      .loginBySms({ mobile, code: formData.value.code })
      .then(() => userStore.getInfo())
      .then(() => {
        toast.success("登录成功");
        setTimeout(() => { uni.reLaunch({ url: redirect.value }); }, 800);
      })
      .catch((error: any) => { toast.error(error?.message || "登录失败"); })
      .finally(() => { loading.value = false; });
  }
};

const handleSendCode = async () => {
  if (smsCountdown.value > 0) return;
  const mobile = (formData.value.username || "").trim();
  if (!mobile) { toast.error("请输入手机号"); return; }
  if (!isValidMobile(mobile)) { toast.error("请输入正确的手机号"); return; }

  try {
    await AuthAPI.sendSmsLoginCode(mobile);
    toast.success("验证码已发送");
    smsCountdown.value = 60;
    if (smsTimer.value) clearInterval(smsTimer.value);
    smsTimer.value = setInterval(() => {
      smsCountdown.value -= 1;
      if (smsCountdown.value <= 0) {
        smsCountdown.value = 0;
        if (smsTimer.value) { clearInterval(smsTimer.value); smsTimer.value = null; }
      }
    }, 1000);
  } catch (error: any) {
    toast.error(error?.message || "发送失败");
  }
};

const navigateToAgreement = (type: string) => {
  const url = type === 'user' ? "/pages/mine/settings/agreement/index" : "/pages/mine/settings/privacy/index";
  uni.navigateTo({ url });
};
</script>

<style lang="scss" scoped>
// Arco Design 色值
$primary-color: #165dff;
$primary-1: #e8f3ff;
$primary-2: #bedaff;
$primary-3: #94bfff;
$primary-4: #6aa3ff;
$primary-5: #4080ff;
$disabled-bg: #e5e7eb;

.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

// ============ 背景 - 参考 PC 端多层渐变设计 ============
.login-page__bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  // 多层背景叠加：主渐变 + 左上柔光 + 右下柔光 + 白色覆盖层
  background:
    // 白色覆盖层
    linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 35%, transparent 100%),
    // 右下角次级柔光
    radial-gradient(ellipse 55% 55% at 80% 70%, rgba(22, 93, 255, 0.3) 0%, rgba(22, 93, 255, 0.12) 50%, transparent 100%),
    // 左上角主柔光
    radial-gradient(ellipse 60% 60% at 20% 15%, rgba(64, 128, 255, 0.35) 0%, rgba(64, 128, 255, 0.18) 40%, transparent 100%),
    // 主渐变背景
    linear-gradient(135deg, #f3f7ff 0%, #e3edff 60%, #d6e7ff 100%);
}

// ============ 主内容 ============
.login-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 300rpx 88rpx 60rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

// ============ Logo ============
.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
  
  &__img {
    width: 96rpx;
    height: 96rpx;
    margin-bottom: 16rpx;
  }
  
  &__name {
    font-size: 32rpx;
    font-weight: 600;
    color: #1f2937;
    letter-spacing: 2rpx;
  }
}

// ============ 卡片 ============
.login-card {
  width: 100%;
  padding: 48rpx 48rpx 36rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  &__header {
    text-align: center;
    margin-bottom: 40rpx;
  }

  &__title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12rpx;
  }

  &__desc {
    font-size: 26rpx;
    color: #86909c;
  }
}

// ============ 表单 ============
.login-form {
  margin-bottom: 24rpx;
}

.login-field {
  position: relative;
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 28rpx;
  margin-bottom: 28rpx;
  background: #f7f8fa;
  border-radius: 48rpx;
  transition: all 0.2s;

  &:focus-within {
    background: #ffffff;
    box-shadow: 0 0 0 2rpx $primary-color;
  }

  &__icon {
    flex-shrink: 0;
    width: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__input {
    flex: 1;
    height: 100%;
    font-size: 30rpx;
    color: #1f2937;
  }

  &__placeholder {
    color: #c9cdd4;
  }

  &__toggle {
    flex-shrink: 0;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__code-btn {
    flex-shrink: 0;
    height: 56rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    font-weight: 500;
    color: $primary-color;
    background: rgba(22, 93, 255, 0.08);
    border-radius: 28rpx;
    transition: all 0.2s;

    &:active {
      background: rgba(22, 93, 255, 0.15);
    }

    &.is-disabled {
      color: #c9cdd4;
      background: #f3f4f6;
    }
  }
}

// ============ 按钮 ============
.login-submit {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #165dff, #4080ff);
  border: none;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(22, 93, 255, 0.3);
  transition: all 0.25s;

  &:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(22, 93, 255, 0.35);
  }

  &.is-disabled,
  &:disabled {
    background: $disabled-bg;
    color: #ffffff;
    box-shadow: none;
    opacity: 1;
  }
}

// ============ 切换链接 ============
.login-switch {
  margin-top: 32rpx;
  text-align: center;
  padding: 16rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &__prefix {
    font-size: 26rpx;
    color: #86909c;
  }

  &__link {
    font-size: 26rpx;
    color: $primary-color;
    font-weight: 500;
    padding: 4rpx 8rpx;
    border-bottom: 2rpx solid $primary-color;
    transition: all 0.2s;

    &:active {
      opacity: 0.7;
    }
  }
}

// ============ 协议 ============
.login-agreement {
  padding-top: 28rpx;
  border-top: 1rpx solid #f2f3f5;

  :deep(.wd-checkbox) {
    align-items: flex-start;
  }

  &__text {
    font-size: 24rpx;
    color: #86909c;
    line-height: 1.5;
  }

  &__link {
    color: $primary-color;
  }
}

// ============ 暗黑模式 ============
@media (prefers-color-scheme: dark) {
  .login-page__bg {
    background:
      // 深色覆盖层
      linear-gradient(135deg, rgba(18, 22, 36, 0.3) 0%, transparent 50%, transparent 100%),
      // 右下角次级柔光
      radial-gradient(ellipse 55% 55% at 80% 70%, rgba(22, 93, 255, 0.35) 0%, rgba(22, 93, 255, 0.12) 50%, transparent 100%),
      // 左上角主柔光
      radial-gradient(ellipse 60% 60% at 20% 15%, rgba(98, 142, 255, 0.4) 0%, rgba(98, 142, 255, 0.18) 50%, transparent 100%),
      // 主渐变背景
      linear-gradient(135deg, #0b1324 0%, #162135 60%, #1e2c44 100%);
  }

  .login-logo__name { color: #e5e6eb; }

  .login-card {
    background: rgba(29, 33, 41, 0.96);
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);

    &__title { color: #e5e6eb; }
    &__desc { color: #86909c; }
  }

  .login-field {
    background: #2a2f3a;

    &:focus-within {
      background: #323844;
      box-shadow: 0 0 0 2rpx $primary-color;
    }

    &__input { color: #e5e6eb; }
    &__placeholder { color: #6b7280; }
    &__code-btn {
      color: #5a8bff;
      background: rgba(22, 93, 255, 0.2);

      &.is-disabled { color: #4b5563; background: #1f2937; }
    }
  }

  .login-submit {
    background: linear-gradient(135deg, #165dff, #4080ff);
    box-shadow: 0 8rpx 24rpx rgba(22, 93, 255, 0.35);

    &.is-disabled,
    &:disabled {
      background: #3a3a3a;
      color: #6b7280;
    }
  }

  .login-switch {
    &__prefix { color: #86909c; }
    &__link { color: #5a8bff; border-bottom-color: #5a8bff; }
  }

  .login-agreement {
    border-top-color: #3a3f4a;
    &__text { color: #86909c; }
    &__link { color: #5a8bff; }
  }
}

// 类名兼容
:deep(.dark),
.dark {
  .login-page__bg {
    background:
      linear-gradient(135deg, rgba(18, 22, 36, 0.3) 0%, transparent 50%, transparent 100%),
      radial-gradient(ellipse 55% 55% at 80% 70%, rgba(22, 93, 255, 0.35) 0%, rgba(22, 93, 255, 0.12) 50%, transparent 100%),
      radial-gradient(ellipse 60% 60% at 20% 15%, rgba(98, 142, 255, 0.4) 0%, rgba(98, 142, 255, 0.18) 50%, transparent 100%),
      linear-gradient(135deg, #0b1324 0%, #162135 60%, #1e2c44 100%);
  }
  .login-logo__name { color: #e5e6eb; }
  .login-card { background: rgba(29, 33, 41, 0.96); &__title { color: #e5e6eb; } &__desc { color: #86909c; } }
  .login-field { background: #2a2f3a; &__input { color: #e5e6eb; } }
  .login-submit { background: linear-gradient(135deg, #165dff, #4080ff); &.is-disabled, &:disabled { background: #3a3a3a; color: #6b7280; } }
  .login-switch__prefix { color: #86909c; }
  .login-switch__link { color: #5a8bff; border-bottom-color: #5a8bff; }
  .login-agreement { border-top-color: #3a3f4a; &__text { color: #86909c; } &__link { color: #5a8bff; } }
}
</style>
