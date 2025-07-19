import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-file-upload',
  standalone: false,
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss'
})

export class FileUpload {
  user: firebase.User | null = null;
  files: any[] = [];
  filteredFiles: any[] = [];
  selectedFile!: File;
  searchTerm: string = '';
  qrCodeDataUrl: string = '';
  showQRCode: boolean = false;
  selectedFileForQR: any = null;

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
      this.filterFiles();
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

  // Search functionality
  filterFiles() {
    if (!this.searchTerm.trim()) {
      this.filteredFiles = [...this.files];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredFiles = this.files.filter(file => 
        file.originalname.toLowerCase().includes(search) ||
        file.mimetype.toLowerCase().includes(search)
      );
    }
  }

  onSearchChange() {
    this.filterFiles();
  }

  // Public link generation
  async generatePublicLink(file: any) {
    const token = await this.user?.getIdToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get(`${environment.backendUrl}/public-link/${file._id}`, { headers })
      .subscribe((response: any) => {
        // Copy to clipboard
        navigator.clipboard.writeText(response.publicUrl).then(() => {
          alert('Public link copied to clipboard!');
        });
      });
  }

  // QR Code generation
  async generateQRCode(file: any) {
    const token = await this.user?.getIdToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get(`${environment.backendUrl}/public-link/${file._id}`, { headers })
      .subscribe(async (response: any) => {
        try {
          this.qrCodeDataUrl = await QRCode.toDataURL(response.publicUrl);
          this.selectedFileForQR = file;
          this.showQRCode = true;
        } catch (error) {
          console.error('Error generating QR code:', error);
          alert('Error generating QR code');
        }
      });
  }

  closeQRCode() {
    this.showQRCode = false;
    this.qrCodeDataUrl = '';
    this.selectedFileForQR = null;
  }
}
