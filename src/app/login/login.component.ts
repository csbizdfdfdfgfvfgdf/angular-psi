import {ChangeDetectionStrategy, Component, HostListener, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {LoginService} from './login.service';
import {RegisterUser, ResetPwd, User} from '../model/user';
import {Res} from '../model/response';
import {NzMessageService} from 'ng-zorro-antd';
import {LoginToken} from '../model/login-token';
import { TranslateService } from '@ngx-translate/core';
import { subscribeOn } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {
//  component variables 
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

    // this event trigger when you resize your windows to make it responsive
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
        // this is subscribedOn click on register button any time when clicked on registration link it will be called
        this.activatedroute.paramMap.subscribe(params => {
            if (params.get('doaction') === 'doregister') {
                this.registerBox();
            }
        });

        // adding local languages this time we have just two lanuages
        this.translate.addLangs(['en', 'ch']);
        let dfltLang = localStorage.getItem('lang');
        if(dfltLang != null && dfltLang != ''){
            this.translate.setDefaultLang(dfltLang);
        }else{
            this.translate.setDefaultLang('en');
        }
    } 

    getScale() {
        return {
            transform: `scale(${this.scale})`
        };
    }

// login button clicked event it will authenticate the user
    login() { 
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

// register button clicked event called. it will send details to save user
// after completion it will auto login with that users
    register() {
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

    // these two flags are just to replace login screen with registeration and vise vrsa 
    registerBox() {
        this.translates = true;
    } 
    loginBox() {
        this.translates = false;
    }

    // modal windo will open when try to retirve password
    showModal(): void {
        this.Visible = true;
    }

    // called when read Private policy link clicked it will route to policy page
    goToPrivacyPolicy(){
        this.router.navigate(['/privacy-terms']);
    }

    // these are some methods used on different cases when cancel clicked to go to back screen
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
