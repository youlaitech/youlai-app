<template>
  <view class="login-page dark:text-[var(--wot-dark-color)]">
    <!-- 背景图 -->
    <image src="/static/images/login-bg.svg" mode="aspectFill" class="login-page__bg" />

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 账号密码登录表单 -->
      <wd-form v-if="loginType === 'account'" ref="loginFormRef" :model="loginFormData">
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

        <!-- 切换登录方式 -->
        <view class="login-switch" @click="loginType = 'phone'">
          <text>使用手机号一键登录</text>
          <wd-icon name="arrow-right" size="12" />
        </view>
      </wd-form>

      <!-- 手机号登录 -->
      <view v-else class="phone-login">
        <view class="phone-login__title">微信一键登录</view>
        <view class="phone-login__subtitle">授权后将获取您的手机号</view>

        <button
          class="wechat-btn"
          :disabled="loading"
          open-type="getPhoneNumber"
          @getphonenumber="handleWechatPhoneLogin"
        >
          <wd-icon name="weixin" size="24" color="#ffffff" />
          <text class="ml-16rpx">微信一键登录</text>
        </button>

        <!-- 切换登录方式 -->
        <view class="login-switch" @click="loginType = 'account'">
          <text>使用账号密码登录</text>
          <wd-icon name="arrow-right" size="12" />
        </view>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="other-login__title">
          <view class="other-login__line"></view>
          <text class="other-login__text">其他登录方式</text>
          <view class="other-login__line"></view>
        </view>

        <view class="flex-center" @click="handleWechatLogin">
          <view class="wechat-icon">
            <image src="/static/icons/weixin.png" class="w-40rpx h-40rpx" />
          </view>
        </view>
      </view>

      <!-- 底部协议 -->
      <view class="login-agreement">
        <text class="login-agreement__text">登录即同意</text>
        <text class="login-agreement__link" @click="navigateToUserAgreement">《用户协议》</text>
        <text class="login-agreement__text">和</text>
        <text class="login-agreement__link" @click="navigateToPrivacy">《隐私政策》</text>
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
import { type LoginData } from "@/api/auth";
import { useUserStore } from "@/store/modules/user-store";
import { useToast } from "wot-design-uni";
import { useWechat } from "@/composables/useWechat";

const loginFormRef = ref();
const toast = useToast();
const loading = ref(false);
const userStore = useUserStore();
const showPassword = ref(false);
const loginType = ref<"account" | "phone">("account");
const { authState, getLoginCode, getPhoneNumber } = useWechat();

// 登录表单数据
const loginFormData = ref<LoginData>({
  username: "admin",
  password: "123456",
});

// 仅使用 query 作为重定向来源
const redirect = ref("/pages/index/index");
onLoad((options) => {
  const fromQuery = options && options.redirect ? decodeURIComponent(options.redirect) : "";
  if (fromQuery && fromQuery !== "/pages/login/index") {
    redirect.value = fromQuery;
  }
});

// 强制清除输入框背景色
onMounted(() => {
  setTimeout(() => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.style.backgroundColor = "transparent";
      input.style.boxShadow = "none";
    });
  }, 100);
});

// 账号密码登录处理
const handleAccountLogin = () => {
  if (loading.value) return;

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
    .catch((error) => {
      toast.error(error?.message || "登录失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

// 微信一键登录（通过手机号）
const handleWechatPhoneLogin = async (e: any) => {
  if (loading.value || authState.value.isLogining) return;
  loading.value = true;

  try {
    // 获取手机号加密数据
    const phoneData = await getPhoneNumber(e);

    // 调用登录接口
    const result: any = await userStore.loginWithWxPhone(phoneData);

    // 获取用户信息
    await userStore.getInfo();
    toast.success("登录成功");

    // 检查是否为新用户或信息不完整
    if (result.isNewUser || !userStore.isUserInfoComplete()) {
      // 跳转到完善信息页面
      setTimeout(() => {
        // 跳转完善资料，redirect 保持在缓存中供目标页读取
        uni.navigateTo({ url: "/pages/mine/profile/complete-profile" });
      }, 1000);
    } else {
      // 跳转到重定向页面
      setTimeout(() => {
        uni.reLaunch({ url: redirect.value });
      }, 1000);
    }
  } catch (error: any) {
    if (error.message === "用户拒绝授权") {
      toast.error("您已拒绝授权获取手机号");
    } else {
      toast.error(error?.message || "登录失败");
    }
    console.error("微信手机号登录失败:", error);
  } finally {
    loading.value = false;
  }
};

// 微信授权登录处理
const handleWechatLogin = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    // #ifdef MP-WEIXIN
    // 获取微信登录的临时 code
    const code = await getLoginCode();

    // 尝试使用微信授权登录接口
    const result: any = await userStore.loginWithWxCode(code);

    // 获取用户信息
    await userStore.getInfo();
    toast.success("登录成功");

    // 检查用户信息是否完整
    if (result.isNewUser || !userStore.isUserInfoComplete()) {
      // 如果信息不完整，跳转到完善信息页面
      setTimeout(() => {
        uni.navigateTo({ url: "/pages/mine/profile/complete-profile" });
      }, 1000);
    } else {
      // 否则直接跳转到重定向页面
      setTimeout(() => {
        uni.reLaunch({ url: redirect.value });
      }, 1000);
    }
    // #endif

    // #ifndef MP-WEIXIN
    toast.error("当前环境不支持微信登录");
    // #endif
  } catch (error: any) {
    toast.error(error?.message || "微信登录失败");
  } finally {
    loading.value = false;
  }
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
  min-height: 100vh;
  overflow: hidden;
  background-color: var(--wot-color-bg-container);

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
  width: 80%; // 进一步减少宽度，增加更多左右间距
  padding: 40rpx;
  margin-top: 200rpx;
  background-color: var(--wot-card-bg);
  border-radius: 24rpx;
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

// 微信按钮
.wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  font-size: 32rpx;
  color: #ffffff;
  background-color: #07c160;
  border: none;
  border-radius: 44rpx;
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

// 微信图标
.wechat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background-color: #07c160;
  border-radius: 50%;
}

// 登录协议
.login-agreement {
  display: flex;
  justify-content: center;
  margin-top: 60rpx;
  font-size: 24rpx;

  &__text {
    color: var(--wot-color-text-secondary);
  }

  &__link {
    color: var(--wot-color-theme);
  }
}
</style>
