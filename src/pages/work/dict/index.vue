<template>
  <view class="page page--padding page--pt">
    <view>
      <wd-search
        v-model="queryParams.keywords"
        placeholder="搜索字典名称/编码"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <view class="mt-16rpx">
      <wd-card
        v-for="item in pageData"
        :key="item.id"
        custom-class="item-card"
        @click="openDictItemPage(item)"
      >
        <view class="flex-start">
          <view class="flex-1">
            <view class="flex-start">
              <text class="font-bold text-32rpx">{{ item.name }}</text>
            </view>
            <text class="text-24rpx color-text-secondary">字典编码：{{ item.dictCode }}</text>
          </view>
          <wd-tag :type="item.status === 1 ? 'success' : 'danger'" plain>
            {{ item.status === 1 ? "启用" : "禁用" }}
          </wd-tag>
        </view>

        <view class="flex-between mt-16rpx">
          <text class="text-24rpx color-text-placeholder">{{ item.remark || "暂无备注" }}</text>
          <view
            class="w-88rpx h-88rpx flex-center rounded-full"
            hover-class="bg-[var(--color-text-placeholder)]/16"
            @click.stop="showDictActions(item)"
          >
            <wd-icon name="more" size="18" class="color-text-secondary" />
          </view>
        </view>
      </wd-card>

      <wd-loadmore v-if="total > 0" :state="loadMoreState" @reload="fetchDictTypeList" />
      <wd-status-tip v-else-if="total === 0" image="search" tip="暂无数据" />
    </view>

    <wd-popup
      v-model="dialog.visible"
      position="bottom"
      custom-style="border-radius: 24rpx 24rpx 0 0"
      @close="closeDictDialog"
    >
      <view class="p-4">
        <view class="text-center font-bold text-32rpx mb-4">
          {{ formData.id ? "编辑字典" : "新增字典" }}
        </view>
        <wd-form ref="formRef" :model="formData" :rules="rules">
          <wd-cell-group border>
            <wd-input v-model="formData.name" label="字典名称" required />
            <wd-input v-model="formData.dictCode" label="字典编码" required />
            <wd-cell title="状态">
              <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </wd-cell>
            <wd-textarea
              v-model="formData.remark"
              label="备注"
              placeholder="请输入备注"
              :maxlength="100"
              show-word-limit
            />
          </wd-cell-group>
        </wd-form>
        <view class="popup-actions">
          <wd-button type="info" plain @click="closeDictDialog">取消</wd-button>
          <wd-button type="primary" :loading="submitting" @click="submitDictForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <view
      v-if="hasPermission('sys:dict:create') && !dialog.visible"
      class="fab-add"
      @click.stop="openDictDialog()"
    >
      <wd-icon name="add" size="44rpx" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { useRouter } from "uni-mini-router";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useToast } from "wot-design-uni";
import DictAPI, {
  type DictTypeForm,
  type DictTypePageQuery,
  type DictTypePageVO,
} from "@/api/dict";
import { hasPermission } from "@/utils/permission";

const router = useRouter();
const toast = useToast();
const loadMoreState = ref<LoadMoreState>("loading");
const formRef = ref();
const submitting = ref(false);

const queryParams = reactive<DictTypePageQuery>({ pageNum: 1, pageSize: 10, keywords: "" });
const total = ref(0);
const pageData = ref<DictTypePageVO[]>([]);
const dialog = reactive({ visible: false });

const initialFormData: DictTypeForm = {
  id: undefined,
  name: undefined,
  dictCode: undefined,
  status: 1,
  remark: undefined,
};

const formData = reactive<DictTypeForm>({ ...initialFormData });

const rules: FormRules = {
  name: [{ required: true, message: "请输入字典名称" }],
  dictCode: [{ required: true, message: "请输入字典编码" }],
};

const handleSearch = () => loadDictTypeList();

function loadDictTypeList() {
  queryParams.pageNum = 1;
  fetchDictTypeList();
}

function fetchDictTypeList() {
  loadMoreState.value = "loading";
  DictAPI.getPage(queryParams)
    .then((data: any) => {
      pageData.value = data.list;
      total.value = data.total;
      queryParams.pageNum++;
    })
    .catch(() => {
      pageData.value = [];
    })
    .finally(() => {
      loadMoreState.value = "finished";
    });
}

function openDictItemPage(item: DictTypePageVO) {
  if (!item.dictCode) return;
  router.push({
    path: "/pages/work/dict/item/index",
    query: { dictCode: item.dictCode, title: `【${item.name}】字典数据` },
  });
}

async function openDictDialog(id?: string) {
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
  dialog.visible = true;
  if (id) {
    formData.id = id;
    const data = await DictAPI.getFormData(id);
    Object.assign(formData, data, { id });
  }
}

function submitDictForm() {
  formRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    submitting.value = true;
    const id = formData.id;
    const action = id ? DictAPI.update(id, formData) : DictAPI.create(formData);
    action
      .then(() => {
        toast.success("操作成功");
        closeDictDialog();
        loadDictTypeList();
      })
      .finally(() => {
        submitting.value = false;
      });
  });
}

function closeDictDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

function showDictActions(item: DictTypePageVO) {
  const actions: string[] = [];
  const actionMap: Record<string, () => void> = {};

  actions.push("字典数据");
  actionMap["字典数据"] = () => openDictItemPage(item);

  if (hasPermission("sys:dict:update")) {
    actions.push("编辑");
    actionMap["编辑"] = () => openDictDialog(item.id);
  }

  if (hasPermission("sys:dict:delete")) {
    actions.push("删除");
    actionMap["删除"] = async () => {
      const { confirm } = await uni.showModal({
        title: "确认删除",
        content: `确定要删除字典「${item.name}」吗？`,
      });
      if (confirm && item.id) {
        await DictAPI.deleteByIds(String(item.id));
        toast.success("删除成功");
        loadDictTypeList();
      }
    };
  }

  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      const action = actions[tapIndex];
      actionMap[action]?.();
    },
  });
}

onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    fetchDictTypeList();
  } else {
    loadMoreState.value = "finished";
  }
});

onLoad(() => {
  loadDictTypeList();
});
</script>

<script lang="ts">
export default { options: { styleIsolation: "shared" } };
</script>

<route lang="json">
{
  "name": "dict",
  "style": {
    "navigationBarTitleText": "字典管理"
  }
}
</route>
