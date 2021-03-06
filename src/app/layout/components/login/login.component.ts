import { Component, OnInit, OnDestroy} from '@angular/core';
import { NavigationExtras } from '@angular/router';

//rxjs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// @Ngrx
import { Store } from '@ngrx/store';
import { AppState } from './../../../core/+store';
import * as RouterActions from './../../../core/+store/router/router.actions';


import { AuthService } from './../../../core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy{
  message: string;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    public authService: AuthService, 
    private store: Store<AppState>
  ) { }

  ngOnInit() {
    this.setMessage();
  }

  ngOnDestroy() {
    console.log('[takeUntil ngOnDestroy]');
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onLogin() {
    this.message = 'Trying to log in ...';
    this.authService
      .login()
      // The TakeUntil subscribes and begins mirroring the source Observable.
      // It also monitors a second Observable that you provide.
      // If this second Observable emits an item or sends a termination notification,
      // the Observable returned by TakeUntil stops mirroring the source Observable and terminates.
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
       () => {
         this.setMessage();
         if (this.authService.isLoggedIn) {
           // Get the redirect URL from our auth service
           // If no redirect has been set, use the default
          const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/admin';

          const navigationExtras: NavigationExtras = {
            queryParamsHandling: 'preserve',
            preserveFragment: true
          };
  
          // Redirect the user
          this.store.dispatch(new RouterActions.Go({
            path: [redirect],
            extras: navigationExtras
          }));

      }
    },
        err => console.log(err),
        () => console.log('[takeUntil] complete')
    );
  }

  onLogout() {
    this.authService.logout();
    this.setMessage();
  }

  private setMessage() {
    this.message = 'Logged ' + (this.authService.isLoggedIn ? 'in' : 'out');
  }

}
