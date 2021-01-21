import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NzMessageService} from 'ng-zorro-antd';
import {UrlService} from '../service/url.service'; 
import {LoginService} from "../../login/login.service";
import { TranslateService } from '@ngx-translate/core';
import { NoteService } from 'src/app/pages/home/manage-notepad/note.service';


@Injectable()
export class AppInterceptor implements HttpInterceptor {

    token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : '';
    uuid = localStorage.getItem('uuid') ? localStorage.getItem('uuid') : '';

    constructor(private router: Router,
                private message: NzMessageService,
                private urlService: UrlService,
                private translateService:TranslateService,
                private noteService: NoteService,
                private loginService: LoginService) {
        // 设置uuid
        this.noteService.uuidSubject.subscribe((res: string) => {
            console.log();
            this.uuid = res;
        })

        // 设置token
        this.loginService.tokenSubject.subscribe((res: string) => {
            this.token = res;
        })
    }


    // 禁止在拦截器内修改请求头, 修改返回内容
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // 克隆请求头
        const authReq = req.clone({
            setHeaders: {
                'Access-Control-Allow-Origin':'*',
                'Cache-Control': 'no-cache',          // 去除IE get请求缓存
                'Pragma': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest', // 业务需求
                'uuid': this.uuid?this.uuid:'',
                "Authorization": `Bearer ${this.token}`
            }
        });


        return next.handle(authReq).pipe(
            tap(
                event => {
                    if (event instanceof HttpResponse) {
                        // event.status http状态值
                        if (event.status === 200) {
                            const body = event.body;
                            if (body instanceof Blob) {                 // 文件流不拦截  业务需求
                                return event;
                            } else if (body.code === 401) {
                                if (this.token) {
                                    // 用户token过期
                                    this.message.error('此用户未登录,或长时间未操作,请跳转到平台重新登录');
                                } else {
                                    // 用户未登陆，使用游客身份

                                }
                            } else if (body.code !== 200) {
                                // this.message.error(body.msg);
                            }
                        }
                    }
                    return event;
                },
                event => {
                    if (event.status === 401) {
                        // this.message.error('此用户未登录,或长时间未操作,请跳转到平台重新登录');
                        // const returnUrl = localStorage.getItem('returnUrl');
                        // if (returnUrl) {
                        //   window.location.replace(returnUrl);
                        // }
                    } else {
                        this.message.error('Http Error' + ' ---- httpCode:' + event.status);
                    }
                    return event;
                })
        );

    }
    getTranslationString(key:string, params:Object):string {
        let str:string;
        this.translateService.get(key, params).subscribe((res: string) => { 
          str = res;
        });
        return str;
      } 
    // 设置uuid


}
