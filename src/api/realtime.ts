import { ApiCode } from "@/enums/api-code-enum";
import request, { RequestError } from "@/utils/request";
import type {
  CreateRealtimeTicketRequest,
  RealtimeTicketResponse,
} from "@/utils/realtime/protocol";

const RealtimeAPI = {
  /**
   * 领取单次连接票据，服务未启用或无权连接时返回 null
   */
  async createTicket(data: CreateRealtimeTicketRequest): Promise<RealtimeTicketResponse | null> {
    try {
      return await request<RealtimeTicketResponse>({
        url: "/api/v1/realtime/tickets",
        method: "POST",
        data,
        timeout: 8_000,
      });
    } catch (error) {
      if (
        error instanceof RequestError &&
        (error.statusCode === 403 ||
          (error.statusCode === 503 && error.code === ApiCode.REALTIME_DISABLED))
      ) {
        return null;
      }
      throw error;
    }
  },
};

export default RealtimeAPI;
