<template>
  <view class="login-page dark:text-[var(--wot-color-text)]">
    <!-- 背景图 -->
    <image src="/static/images/login-bg.svg" mode="aspectFill" class="login-page__bg" />

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 账号密码登录表单 -->
      <wd-form v-if="loginMode === 'ACCOUNT'" ref="loginFormRef" :model="loginFormData">
        <!-- 用户名输入框 -->
        <view class="login-form__item">
          <wd-icon name="user" size="22" class="mr-20rpx" />
          <input
            v-model="loginFormData.username"
            class="login-form__input"
            placeholder="请输入用户名"
            placeholder-class="login-form__placeholder"
          />
        </view>
        <view class="login-form__divider"></view>

        <!-- 密码输入框 -->
        <view class="login-form__item">
          <wd-icon name="lock-on" size="22" class="mr-20rpx" />
          <input
            v-model="loginFormData.password"
            class="login-form__input"
            :password="!showPassword"
            placeholder="请输入密码"
            placeholder-class="login-form__placeholder"
          />
          <wd-icon
            :name="showPassword ? 'eye-open' : 'eye-close'"
            size="18"
            class="p-10rpx"
            @click="showPassword = !showPassword"
          />
        </view>
        <view class="login-form__divider"></view>

        <!-- 登录按钮 -->
        <button
          class="login-btn"
          :disabled="loading"
          :class="{ 'login-btn--loading': loading }"
          @click="handleAccountLogin"
        >
          {{ loading ? "登录中..." : "账号登录" }}
        </button>
      </wd-form>

      <wd-form v-else ref="smsLoginFormRef" :model="smsLoginFormData">
        <view class="login-form__item">
          <wd-icon name="phone" size="22" class="mr-20rpx" />
          <input
            v-model="smsLoginFormData.mobile"
            class="login-form__input"
            placeholder="请输入手机号"
            placeholder-class="login-form__placeholder"
          />
        </view>
        <view class="login-form__divider"></view>

        <view class="login-form__item">
          <wd-icon name="security" size="22" class="mr-20rpx" />
          <input
            v-model="smsLoginFormData.code"
            class="login-form__input"
            placeholder="请输入验证码"
            placeholder-class="login-form__placeholder"
          />
          <wd-button
            size="small"
            plain
            :disabled="smsCountdown > 0"
            @click="handleSendSmsLoginCode"
          >
            {{ smsCountdown > 0 ? `${smsCountdown}s后重试` : "发送验证码" }}
          </wd-button>
        </view>
        <view class="login-form__divider"></view>

        <button
          class="login-btn"
          :disabled="loading"
          :class="{ 'login-btn--loading': loading }"
          @click="handleSmsLogin"
        >
          {{ loading ? "登录中..." : "短信登录" }}
        </button>
      </wd-form>

      <view class="login-switch" @click="loginMode = loginMode === 'ACCOUNT' ? 'SMS' : 'ACCOUNT'">
        {{ loginMode === "ACCOUNT" ? "使用短信验证码登录" : "使用账号密码登录" }}
      </view>

      <!-- 底部协议 -->
      <view class="login-agreement">
        <wd-checkbox v-model="isAgreePolicy" shape="square" size="16px">
          <view class="login-agreement__content">
            <text class="login-agreement__text">我已阅读并同意</text>
            <text class="login-agreement__link" @click.stop="navigateToUserAgreement">
              《用户协议》
            </text>
            <text class="login-agreement__text">和</text>
            <text class="login-agreement__link" @click.stop="navigateToPrivacy">《隐私政策》</text>
          </view>
        </wd-checkbox>
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
import { onLoad } from "@dcloudio/uni-app";
import AuthAPI, { type LoginData } from "@/api/auth";
import { useUserStore } from "@/store/modules/user-store";
import { useToast } from "wot-design-uni";

const loginFormRef = ref();
const smsLoginFormRef = ref();
const toast = useToast();
const loading = ref(false);
const userStore = useUserStore();
const showPassword = ref(false);
const isAgreePolicy = ref(false); // 是否同意隐私协议

const loginMode = ref<"ACCOUNT" | "SMS">("ACCOUNT");
const smsCountdown = ref(0);
const smsTimer = ref<ReturnType<typeof setInterval> | null>(null);

// 登录表单数据
const loginFormData = ref<LoginData>({
  username: "admin",
  password: "123456",
});

const smsLoginFormData = ref({
  mobile: "",
  code: "",
});

// 仅使用 query 作为重定向来源
const redirect = ref("/pages/index/index");
onLoad((options: any) => {
  const fromQuery = options && options.redirect ? decodeURIComponent(options.redirect) : "";
  if (fromQuery && fromQuery !== "/pages/login/index") {
    redirect.value = fromQuery;
  }
});

// 账号密码登录处理
const handleAccountLogin = () => {
  if (loading.value) return;

  // 检查是否同意隐私协议
  if (!isAgreePolicy.value) {
    toast.error("请先阅读并同意用户协议和隐私政策");
    return;
  }

  // 表单验证
  if (!loginFormData.value.username) {
    toast.error("请输入用户名");
    return;
  }
  if (!loginFormData.value.password) {
    toast.error("请输入密码");
    return;
  }

  loading.value = true;

  userStore
    .login(loginFormData.value)
    .then(() => userStore.getInfo())
    .then(() => {
      toast.success("登录成功");

      console.log("跳转链接", redirect.value);

      // 账号密码登录直接跳转到重定向页面
      setTimeout(() => {
        uni.reLaunch({ url: redirect.value });
      }, 1000);
    })
    .catch((error: any) => {
      toast.error(error?.message || "登录失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleSendSmsLoginCode = async () => {
  if (smsCountdown.value > 0) return;
  if (!smsLoginFormData.value.mobile) {
    toast.error("请输入手机号");
    return;
  }
  try {
    await AuthAPI.sendSmsLoginCode(smsLoginFormData.value.mobile);
    toast.success("验证码已发送");
    smsCountdown.value = 60;
    if (smsTimer.value) clearInterval(smsTimer.value);
    smsTimer.value = setInterval(() => {
      smsCountdown.value -= 1;
      if (smsCountdown.value <= 0) {
        smsCountdown.value = 0;
        if (smsTimer.value) {
          clearInterval(smsTimer.value);
          smsTimer.value = null;
        }
      }
    }, 1000);
  } catch (error: any) {
    toast.error(error?.message || "发送失败");
  }
};

const handleSmsLogin = () => {
  if (loading.value) return;
  if (!isAgreePolicy.value) {
    toast.error("请先阅读并同意用户协议和隐私政策");
    return;
  }
  if (!smsLoginFormData.value.mobile) {
    toast.error("请输入手机号");
    return;
  }
  if (!smsLoginFormData.value.code) {
    toast.error("请输入验证码");
    return;
  }

  loading.value = true;
  userStore
    .loginBySms({ mobile: smsLoginFormData.value.mobile, code: smsLoginFormData.value.code })
    .then(() => userStore.getInfo())
    .then(() => {
      toast.success("登录成功");
      setTimeout(() => {
        uni.reLaunch({ url: redirect.value });
      }, 1000);
    })
    .catch((error: any) => {
      toast.error(error?.message || "登录失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

// 跳转到用户协议页面
const navigateToUserAgreement = () => {
  uni.navigateTo({
    url: "/pages/mine/settings/agreement/index",
  });
};

// 跳转到隐私政策页面
const navigateToPrivacy = () => {
  uni.navigateTo({
    url: "/pages/mine/settings/privacy/index",
  });
};
</script>

<style lang="scss" scoped>
// 登录页面主容器
.login-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; // 垂直居中
  min-height: 100vh;
  overflow: hidden;

  // 背景图
  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
}

// 登录卡片
.login-card {
  position: relative;
  z-index: 2;
  width: 85%; // 移动端保持两边边距
  max-width: 420px; // 桌面端最大宽度
  padding: 50rpx 40rpx;
  background-color: var(--wot-color-bg);
  border: 1rpx solid var(--wot-color-border);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

// 登录表单
.login-form {
  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
  }

  &__input {
    flex: 1;
    height: 60rpx;
    font-size: 28rpx;
    line-height: 60rpx;
    color: var(--wot-color-text);
    background-color: transparent !important;
    border: none;
    outline: none;
  }

  &__divider {
    height: 1px;
    background-color: var(--wot-color-border-light);
  }

  &__placeholder {
    color: var(--wot-color-text-placeholder);
  }
}

// 登录按钮
.login-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 60rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #fff;
  background-color: var(--wot-color-theme);
  border: none;
  border-radius: 44rpx;
  transition: opacity 0.2s;

  &--loading {
    opacity: 0.7;
  }
}

// 切换登录方式
.login-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  font-size: 26rpx;
  color: var(--wot-color-theme);
}

// 手机号登录
.phone-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;

  &__title {
    margin-bottom: 16rpx;
    font-size: 36rpx;
    font-weight: bold;
    color: var(--wot-color-text);
  }

  &__subtitle {
    margin-bottom: 60rpx;
    font-size: 28rpx;
    color: var(--wot-color-text-secondary);
  }
}

// 其他登录方式
.other-login {
  margin-top: 60rpx;

  &__title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
  }

  &__line {
    width: 80rpx;
    height: 1rpx;
    background-color: var(--wot-color-border-light);
  }

  &__text {
    margin: 0 20rpx;
    font-size: 26rpx;
    color: var(--wot-color-text-secondary);
  }
}

// 登录协议
.login-agreement {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: 60rpx;
  font-size: 24rpx;

  :deep(.wd-checkbox) {
    align-items: flex-start;
  }

  &__content {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    line-height: 1.6;
  }

  &__text {
    color: var(--wot-color-text-secondary);
  }

  &__link {
    color: var(--wot-color-theme);
    text-decoration: underline;
  }
}
</style>
