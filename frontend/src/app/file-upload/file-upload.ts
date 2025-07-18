import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-file-upload',
  standalone: false,
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss'
})

export class FileUpload {
user: firebase.User | null = null;
  files: any[] = [];
  selectedFile!: File;

  constructor(private afAuth: AngularFireAuth, private http: HttpClient) {
    this.afAuth.authState.subscribe(user => {
      this.user = user;
      if (user) this.fetchFiles();
    });
  }

  loginWithGoogle() {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.signOut();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadFile() {
    if (!this.selectedFile || !this.user) return;

    const token = await this.user.getIdToken();
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(environment.backendUrl + '/upload', formData, { headers })
      .subscribe(() => {
        alert('Upload successful!');
        this.fetchFiles();
      });
  }

  async fetchFiles() {
    const token = await this.user?.getIdToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(environment.backendUrl, { headers }).subscribe(data => {
      this.files = data;
    });
  }

  async downloadFile(fileId: string) {
    const token = await this.user?.getIdToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${environment.backendUrl}/download/${fileId}`, {
      headers,
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'file';
      a.click();
    });
  }
}
