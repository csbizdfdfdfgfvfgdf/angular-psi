import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {UrlService} from '../common/service/url.service';
import {RegisterUser, ResetPwd, User} from '../model/user';
import {Api} from '../api/api';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    // token主体

    tokenSubject: Subject<string> = new Subject();

    constructor(private http: HttpClient,
                private urlService: UrlService) {
    }

    login(user: User): Observable<any> {
        const url = this.urlService.getUrl(Api.login);
        return this.http.post(url, user);
    }

    register(registerUser: RegisterUser): Observable<any> {
        const url = this.urlService.getUrl(Api.register);
        return this.http.post(url, registerUser);
    }

    // 邮件找回密码
    retrievePwd(email: string) {
        const url = this.urlService.getUrl(Api.retrievePwd);
        return this.http.post(url, {email});
    }

    // 重置密码
    resetPwd(data: ResetPwd) {

        data.token = localStorage.getItem('token');
        const url = this.urlService.getUrl(Api.resetPwd);
        return this.http.post(url, data);
    }


}
