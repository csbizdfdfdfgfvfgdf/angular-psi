import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Api} from '../../../api/api';
import {UrlService} from '../../../common/service/url.service';
import {Menu} from '../../../model/menu';
import {MoveItem} from '../../../model/move-item';

interface MenuSort {
    pid: number;
    mid_arr: Array<number>;
}


@Injectable({
    providedIn: 'root'
})


export class Note2Service {

    // 表拖动到树结构拖动完成
    transTreeDragEnd: Subject<any> = new Subject<any>();

    constructor(private http: HttpClient,
                private url: UrlService) {
    }

    // 新增文件夹

    addFile(data) {
        const url = this.url.getUrl(Api.addMenu);
        return this.http.post(url, data);
    }

    // 修改文件夹

    editFile(data: {
        menuId: number,
        menuName: string
    }) {
        const url = this.url.getUrl(Api.updateMenu);
        return this.http.put(url, data);
    }

    // 删除文件夹
    delFile(data: Menu) {
        const url = this.url.getUrl(Api.delMenu);
        return this.http.delete(url + '/' + data);
    }

    // 修改文件夹节点排序
    updateMenuSort(data: MenuSort) {
        const url = this.url.getUrl(Api.updateMenuSort);
        return this.http.put(url, data);
    }

    updateMenuSort_gen(menu: Menu) {
        const data: {menuId: number, orderId: number, pId: number} = {menuId: 0, orderId: 0, pId: 0};
        data.orderId = menu.orderId;
        data.pId = menu.pId;
        data.menuId = menu.menuId;
        const url = this.url.getUrl(Api.updateMenuSort);
        return this.http.put(url, data);
    }

    // 移动文件夹节点排序
    moveItem(data: any) {
        const url = this.url.getUrl(Api.moveItem);
        return this.http.post(url, data);
    }
}
