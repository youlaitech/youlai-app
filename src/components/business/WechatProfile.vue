<template>
  <view class="wechat-profile">
    <!-- 头像选择 -->
    <view class="avatar-section">
      <view class="section-title">头像</view>
      <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image v-if="avatar" :src="avatar" class="avatar-image" mode="aspectFill" />
        <view v-else class="avatar-placeholder">
          <wd-icon name="camera" size="40" color="#999" />
          <text class="placeholder-text">选择头像</text>
        </view>
      </button>
    </view>

    <!-- 昵称输入 -->
    <view class="nickname-section">
      <view class="section-title">昵称</view>
      <input
        v-model="nickname"
        type="nickname"
        class="nickname-input"
        placeholder="请输入昵称"
        :maxlength="20"
        @blur="onNicknameChange"
      />
    </view>

    <!-- 性别选择 -->
    <view class="gender-section">
      <view class="section-title">性别</view>
      <wd-radio-group v-model="gender" shape="button" class="gender-group">
        <wd-radio :value="1" class="gender-radio">男</wd-radio>
        <wd-radio :value="2" class="gender-radio">女</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import FileAPI, { type FileInfo } from "@/api/file";

/**
 * 微信小程序头像昵称组件
 *
 * @description 用于微信小程序环境下的头像、昵称和性别选择
 * @component WechatProfile
 * @example
 * <WechatProfile v-model="profileData" @change="onProfileChange" />
 */

defineOptions({
  name: "WechatProfile",
});

// Props
interface ProfileData {
  avatar?: string;
  nickname?: string;
  gender?: number;
}

interface Props {
  modelValue?: ProfileData;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    avatar: "",
    nickname: "",
    gender: 1,
  }),
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: ProfileData];
  change: [value: ProfileData];
}>();

// 响应式数据
const avatar = ref(props.modelValue?.avatar || "");
const nickname = ref(props.modelValue?.nickname || "");
const gender = ref(props.modelValue?.gender || 1);

// 监听props变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      avatar.value = newValue.avatar || "";
      nickname.value = newValue.nickname || "";
      gender.value = newValue.gender || 1;
    }
  },
  { immediate: true, deep: true }
);

// 监听数据变化并发出事件
const emitChange = () => {
  const value = {
    avatar: avatar.value,
    nickname: nickname.value,
    gender: gender.value,
  };
  emit("update:modelValue", value);
  emit("change", value);
};

// 头像选择处理
const onChooseAvatar = async (e: any) => {
  try {
    const { avatarUrl } = e.detail;

    // 上传头像到服务器
    uni.showLoading({ title: "上传中..." });

    const fileInfo: FileInfo = await FileAPI.upload(avatarUrl);
    avatar.value = fileInfo.url;

    uni.hideLoading();
    uni.showToast({ title: "头像上传成功", icon: "success" });

    emitChange();
  } catch (error) {
    uni.hideLoading();
    console.error("头像上传失败:", error);
    uni.showToast({ title: "头像上传失败", icon: "error" });
  }
};

// 昵称变化处理
const onNicknameChange = () => {
  emitChange();
};

// 监听性别变化
watch(gender, () => {
  emitChange();
});
</script>

<style lang="scss" scoped>
.wechat-profile {
  padding: 20rpx;
}

.section-title {
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--wot-color-text);
}

.avatar-section {
  margin-bottom: 40rpx;

  .avatar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160rpx;
    height: 160rpx;
    padding: 0;
    margin: 0 auto;
    overflow: hidden;
    background: transparent;
    border: none;
    border-radius: 50%;

    &::after {
      border: none;
    }
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--wot-color-bg-light);
    border: 2rpx dashed var(--wot-color-border);
    border-radius: 50%;

    .placeholder-text {
      margin-top: 10rpx;
      font-size: 24rpx;
      color: var(--wot-color-text-secondary);
    }
  }
}

.nickname-section {
  margin-bottom: 40rpx;

  .nickname-input {
    box-sizing: border-box;
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    background: var(--wot-color-bg-light);
    border: 1rpx solid var(--wot-color-border);
    border-radius: 12rpx;
  }
}

.gender-section {
  .gender-group {
    display: flex;
    gap: 20rpx;

    .gender-radio {
      flex: 1;

      :deep(.wd-radio) {
        justify-content: center;
        width: 100%;
      }
    }
  }
}
</style>
