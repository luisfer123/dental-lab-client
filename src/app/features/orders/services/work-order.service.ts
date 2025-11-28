import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { FullWorkOrder } from "../../works/models/full-work-order.model";

@Injectable({ providedIn: 'root' })
export class WorkOrderService {

    private baseUrl = `${environment.apiBaseUrl}/api/orders`;

    constructor(private http: HttpClient) {}

    /* ==========================================================
       CREATE ORDER FOR CLIENT
    ========================================================== */
    createOrderForClient(clientId: number) {
        // Backend returns FullWorkOrderModel
        return this.http.post<FullWorkOrder>(
            `${this.baseUrl}/for-client/${clientId}`, {}
        );
    }

    /* ==========================================================
       GET SINGLE ORDER (full)
    ========================================================== */
    getOrder(orderId: number) {
        return this.http.get<FullWorkOrder>(`${this.baseUrl}/${orderId}`);
    }

    getAll(page: number, size: number, sort: string) {
        return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}&sort=${sort}`);
    }

    getOrdersByClient(clientId: number, page: number, size: number, sort: string) {
        return this.http.get<any>(
            `${this.baseUrl}/client/${clientId}?page=${page}&size=${size}&sort=${sort}`
        );
    }

    markAsDelivered(orderId: number) {
        return this.http.post<FullWorkOrder>(`${this.baseUrl}/${orderId}/deliver`, {});
    }
}
