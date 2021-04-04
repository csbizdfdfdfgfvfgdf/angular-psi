import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '../../../common/service/url.service';
import {Api} from '../../../api/api';
import { Subject, Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import {Menu} from '../../../model/menu';
import {Res} from '../../../model/response';
import {Item} from '../../../model/item';

// services are responsible to send api calls to server like this one
// you can save any object into a temporary varialbes in services by getter setter
interface Itemo {
    pId?: number | string;
    content?: string;
    orderId?: number;
}

export interface ItemArrSort {
    mid: number | string;
    item_id_arr: Array<any>;
}

@Injectable({
    providedIn: 'root'
})
export class NoteService {

    // uuid主体

    uuidSubject: Subject<string> = new Subject();

    // drag主体
    dragSubject: Subject<any> = new Subject<any>();


    constructor(private http: HttpClient,
                private url: UrlService) {
    }


    // 获取菜单列表
    getMenus() {
        const url = this.url.getUrl(Api.menuList);
        return this.http.get(url, {}).pipe(
            map((res: Menu[]) => {
                // 转换tree结构
                const data: Menu[] = res; 
                if (data instanceof Array) { 
                    this.setTreeData(data);
                } else {
                    res = [];
                }
                return res;
            })
        );
    }

    // 获取菜单列表
    getUser() {
        const url = this.url.getUrl(Api.me);
        return this.http.get(url, {});
    }

    // 获取Uuid
    getUuid():Observable<any> {
        const url = this.url.getUrl(Api.makeUuid);
        return this.http.get(url);
    }

    // 添加子节点
    addItem(data: Itemo[]) {
        const url = this.url.getUrl(Api.addItem);
        return this.http.post(url, data);
    }

    // 获取子节点
    getItems(data: Itemo) {
        const url = this.url.getUrl(Api.menuItem);
        return this.http.get(url + '/' + data.pId);
    }
    getItemsByUser() {
        const url = this.url.getUrl(Api.menuItemByUser);
        return this.http.get(url);
    }

    // 删除子节点
    editItem(data) {
        const url = this.url.getUrl(Api.updateItem);
        return this.http.put(url, data);
    }


    // 删除子节点
    delItem(data) {
        const url = this.url.getUrl(Api.delItem); 
        return this.http.delete(url + '/' + data, {});
    }

    // 笔记排序
    updateItemSort(data: ItemArrSort) {
        const url = this.url.getUrl(Api.updateItemSort);
        return this.http.post(url, data);
    }

   // soriting items api call to server
    updateItemSort_gen(item: Item) { 
        item.updated = new Date().toISOString();
        const url = this.url.getUrl(Api.updateItemSort);
        return this.http.put(url, item);
    }
   
    //  will convert linear data to tree strucured object
    setTreeData(data) {
        data = data.map(item => {
            return Object.assign(item, {
                title: item.menuName,
                key: item.menuId,
                expanded: false,
                children: item.child ? this.setTreeData(item.child) : []
            });
        });
        return data;
    }


}
