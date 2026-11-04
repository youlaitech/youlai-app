import request from "@/utils/request";

const CONFIG_BASE_URL = "/api/v1/configs";

const ConfigAPI = {
  /**
   * 获取系统配置分页数据
   */
  getPage(queryParams: ConfigQuery) {
    return request<PageResult<ConfigItem>>({
      url: `${CONFIG_BASE_URL}`,
      method: "GET",
      data: queryParams,
    });
  },

  /**
   * 获取系统配置表单数据
   */
  getFormData(id: number) {
    return request<ConfigForm>({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "GET",
    });
  },

  /**
   * 新增系统配置
   */
  create(data: ConfigForm) {
    return request({
      url: `${CONFIG_BASE_URL}`,
      method: "POST",
      data,
    });
  },

  /**
   * 更新系统配置
   */
  update(id: number, data: ConfigForm) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "PUT",
      data,
    });
  },

  /**
   * 删除系统配置
   *
   * @param ids 系统配置ID，多个以英文逗号(,)分隔
   */
  deleteByIds(ids: string) {
    return request({
      url: `${CONFIG_BASE_URL}/${ids}`,
      method: "DELETE",
    });
  },
};

export default ConfigAPI;

/**
 * 系统配置分页查询参数
 */
export interface ConfigQuery extends PageQuery {
  keywords?: string;
}

/**
 * 系统配置表单对象
 */
export interface ConfigForm {
  id?: number;
  configName?: string;
  configKey?: string;
  configValue?: string;
  remark?: string;
}

/**
 * 系统配置列表项
 */
export interface ConfigItem {
  /** 配置ID，列表数据由后端返回，必填 */
  id: number;
  configName?: string;
  configKey?: string;
  configValue?: string;
  remark?: string;
}
