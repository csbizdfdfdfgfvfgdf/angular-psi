import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {UrlService} from '../common/service/url.service';
import {RegisterUser, ResetPwd, User} from '../model/user';
import {Api} from '../api/api';

  // services are responsible to send api calls to server like this one
  // you can save any object into a temporary varialbes in services by getter setter
@Injectable({
    providedIn: 'root'
})
export class LoginService {

    // token主体

    tokenSubject: Subject<string> = new Subject();

    constructor(private http: HttpClient,
                private urlService: UrlService) {
    }
// login call to sever
    login(user: User): Observable<any> {
        const url = this.urlService.getUrl(Api.login);
        return this.http.post(url, user);
    }
// registration call to server
    register(registerUser: RegisterUser): Observable<any> {
        const url = this.urlService.getUrl(Api.register);
        return this.http.post(url, registerUser);
    }
// verify email by code 
verifyEmail(request): Observable<any> {
    const url = this.urlService.getUrl(Api.verifyEmail);
    return this.http.post(url, request);
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
