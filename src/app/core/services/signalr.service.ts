import { Injectable } from '@angular/core';
import { OnlineUser } from '@core/domain-classes/online-user';
import { SecurityService } from '@core/security/security.service';
import { environment } from '@environments/environment';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClonerService } from './clone.service';
import { TranslationService } from './translation.service';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection: signalR.HubConnection
  private onlineUsers_key: string = 'onlineuser_key';
  private _onlineUsers: BehaviorSubject<OnlineUser[]> = new BehaviorSubject<OnlineUser[]>([]);
  private _userNotification$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public get userNotification$(): Observable<string> {
    return this._userNotification$.asObservable();
  }
  public get connectionId(): string {
    return this.hubConnection.connectionId;
  }

  public get onlineUsers$(): Observable<OnlineUser[]> {
    return this._onlineUsers.pipe(
      map((c: OnlineUser[]) => {
        if (c && c.length > 0) {
          return c;
        } else {
          const onlineUsersStr = localStorage.getItem(this.onlineUsers_key);
          if (onlineUsersStr) {
            const onlineUser = JSON.parse(onlineUsersStr);
            this._onlineUsers.next(onlineUser);
            return onlineUser;
          }
          else {
            return null;
          }
        }
      })
    );
  }

  constructor(
    private clonerService: ClonerService,
    private toastrService: ToastrService,
    public translationService:TranslationService,
    private securityService: SecurityService) { }

  public startConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}userHub`)
        .build();
      this.hubConnection
        .start()
        .then(() => {
          resolve(true)
        })
        .catch(err => {
          reject(false);
        });
    })
  }

  addUser(signalrUser: OnlineUser) {
    this.hubConnection.invoke('join', signalrUser)
      .catch(err => console.error(err));
  }

  forceLogout(id: string) {
    this.hubConnection.invoke('forceLogout', id)
      .catch(err => console.error(err));
  }

  logout(id: string) {
    localStorage.removeItem(this.onlineUsers_key);
    this._onlineUsers.next([]);
    this.hubConnection.invoke('logout', id)
      .catch(err => console.error(err));
  }

  handleMessage = () => {
    this.hubConnection.on('userLeft', (id: string) => {
      this.removeUser(id);
    });
    this.hubConnection.on('newOnlineUser', (onlineUser: OnlineUser) => {
      this.newOnlineUser(onlineUser);
    });

    this.hubConnection.on('sendNotification', (userId: string) => {
      this._userNotification$.next(userId);
    });

    this.hubConnection.on('Joined', (onlineUser: OnlineUser) => {
    });

    this.hubConnection.on('logout', (onlineUser: OnlineUser) => {
      this.removeUser(onlineUser.id);
    });

    this.hubConnection.on('forceLogout', (onlineUser: OnlineUser) => {
      this.removeUser(onlineUser.id);
      this.toastrService.error(this.translationService.getValue('ADMIN_LOGOUT_YOU_FORCEFULLY.'));
      this.securityService.logout();
    });

    this.hubConnection.on('onlineUsers', (onlineUsers: OnlineUser[]) => {
      if (onlineUsers.length > 0) {
        const onlineUsersStr = JSON.stringify(onlineUsers);
        localStorage.setItem(this.onlineUsers_key, onlineUsersStr);
        this._onlineUsers.next(onlineUsers);
      }
      else {
        localStorage.removeItem(this.onlineUsers_key);
        this._onlineUsers.next(this.clonerService.deepClone<OnlineUser[]>([]));
      }
    });

    this.hubConnection.on('sendDM', (message: string, sender: OnlineUser[]) => {
    });
  }

  newOnlineUser(onlineUser: OnlineUser): void {
    const onlineUsersStr = localStorage.getItem(this.onlineUsers_key);
    const onlineUsers = JSON.parse(onlineUsersStr) as OnlineUser[];
    if (onlineUsers && !onlineUsers.find(c => c.id === onlineUser.id)) {
      onlineUsers.push(onlineUser);
      this._onlineUsers.next(this.clonerService.deepClone<OnlineUser[]>(onlineUsers));
    } else {
      this._onlineUsers.next(this.clonerService.deepClone<OnlineUser[]>([onlineUser]));
    }
  }
  removeUser(id: string) {
    const onlineUsersStr = localStorage.getItem(this.onlineUsers_key);
    if (onlineUsersStr) {
      const onlineUsers = JSON.parse(onlineUsersStr) as OnlineUser[];
      const filterOnlineUsers = onlineUsers.filter(c => c.id !== id);
      localStorage.removeItem(this.onlineUsers_key);
      if (filterOnlineUsers && filterOnlineUsers.length > 0) {
        localStorage.setItem(this.onlineUsers_key, JSON.stringify(filterOnlineUsers));
        this._onlineUsers.next(this.clonerService.deepClone<OnlineUser[]>(filterOnlineUsers));
      } else {
        this._onlineUsers.next(this.clonerService.deepClone<OnlineUser[]>([]));
      }
    } else {
      this._onlineUsers.next(this.clonerService.deepClone<OnlineUser[]>([]));
    }
  }

}
