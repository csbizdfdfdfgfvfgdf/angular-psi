import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '../../../common/service/url.service';
import {Api} from '../../../api/api';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Menu} from '../../../model/menu';
import {Res} from '../../../model/response';
import {Item} from '../../../model/item';

interface Itemo {
    pId?: number | string;
    content?: string;
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
                    // res.data = data.map(item => {
                    //     return Object.assign(item, {
                    //         title: item.name,
                    //         key: item.id,
                    //         expanded: true,
                    //         children: item.child
                    //     })
                    // })
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
    getUuid() {
        const url = this.url.getUrl(Api.makeUuid);
        return this.http.get(url, {responseType: 'text'});
    }

    // 添加子节点
    addItem(data: Itemo) {
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

    updateItemSort_gen(item: Item) {
        const data: {itemId: number, pId: number, zindex: number} = {itemId: 0, pId: 0, zindex: 0};
        data.itemId = item.itemId;
        data.pId = item.pId;
        data.zindex = item.zindex;
        const url = this.url.getUrl(Api.updateItemSort);
        return this.http.put(url, data);
    }

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
