import {ChangeDetectionStrategy, Component, HostListener, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {LoginService} from './login.service';
import {RegisterUser, ResetPwd, User} from '../model/user';
import {Res} from '../model/response';
import {NzMessageService} from 'ng-zorro-antd';
import {LoginToken} from '../model/login-token';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {

    scale = 1;
    model = {};
    hide = true;
    user: User = new User();
    registerUser = new RegisterUser();
    resetPwd = new ResetPwd();
    translates = false;
    Visible = false;
    resetVisible = false;
    isOkLoading = false;
    findBackEmail: string;

    @HostListener('window:resize', ['$event'])
    onresize(event): void {
        let size = event.target.outerHeight / 768;
        if (size > 1.2) {
            size = 1.2;
        }
        if (size < 1) {
            size = 1;
        }
        this.scale = size;
    }

    constructor(private loginService: LoginService,
                private messageService: NzMessageService,
                public translate: TranslateService,
                private router: Router, private activatedroute: ActivatedRoute) {
    }

    ngOnInit() {
        this.activatedroute.paramMap.subscribe(params => {
            if (params.get('doaction') === 'doregister') {
                this.registerBox();
            }
        });
        this.translate.addLangs(['en', 'ch']);
        let dfltLang = localStorage.getItem('lang');
        if(dfltLang != null && dfltLang != ''){
            this.translate.setDefaultLang(dfltLang);
        }else{
            this.translate.setDefaultLang('en');
        }
    }

    formSubmit(): void {


    }

    getScale() {
        return {
            transform: `scale(${this.scale})`
        };
    }

    login() {
        console.log('loggin in ');
        this.loginService.login(this.user).subscribe((res: LoginToken) => {
            this.loginService.tokenSubject.next(res.token);
            // 保存token至sessionStorage
            sessionStorage.setItem('token', res.token);
            this.router.navigate(['/home']);
            },
        (error) => {
            this.messageService.warning(this.getTranslationString('login.invalidLogin',''));
        });
    }

    register() {
        this.registerUser.email = this.registerUser.userName ?? this.registerUser.email;
        this.loginService.register(this.registerUser).subscribe(
            res => {
                this.messageService.success(this.getTranslationString('login.regSuccess',''));
                this.user.userName = this.registerUser.userName;
                this.user.password = this.registerUser.password;
                this.login();
                this.loginBox();
            },
            (error) => {
                this.messageService.warning(this.getTranslationString('login.invalidParams',''));
            }
        );
    }


    registerBox() {
        this.translates = true;
    }


    loginBox() {
        this.translates = false;
    }

    showModal(): void {
        this.Visible = true;
    }
    goToPrivacyPolicy(){
        this.router.navigate(['/privacy-terms']);
    }
    handleFindBackOk(): void {
        this.Visible = false;

        this.loginService.retrievePwd(this.findBackEmail).subscribe(
            res => {
                console.log(res);
            }
        );
    }
    handleFindBackCancel(): void {
        this.Visible = false;
    }

    resetCancel(): void {
        this.resetVisible = false;
    }

    resetShowModal(): void {
        this.resetVisible = true;
    }

    resetBackOk(): void {
        this.resetVisible = false;

        this.loginService.resetPwd(this.resetPwd).subscribe(
            res => {
                console.log(res);
            }
        );
    }
    
    getTranslationString(key:string, params:Object):string {
        let str:string;
        this.translate.get(key, params).subscribe((res: string) => { 
          str = res;
        });
        return str;
    } 
}
