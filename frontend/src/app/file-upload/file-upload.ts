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
  selectedFiles: Set<string> = new Set();
  selectAll: boolean = false;

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

  // Delete single file
  async deleteFile(fileId: string, fileName: string) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = await this.user?.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      this.http.delete(`${environment.backendUrl}/${fileId}`, { headers })
        .subscribe(() => {
          alert('File deleted successfully!');
          this.fetchFiles();
        });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  }

  // Bulk delete files
  async deleteSelectedFiles() {
    if (this.selectedFiles.size === 0) {
      alert('Please select files to delete');
      return;
    }

    const fileCount = this.selectedFiles.size;
    if (!confirm(`Are you sure you want to delete ${fileCount} file(s)?`)) {
      return;
    }

    try {
      const token = await this.user?.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      this.http.delete(`${environment.backendUrl}/bulk`, {
        headers,
        body: { fileIds: Array.from(this.selectedFiles) }
      }).subscribe((response: any) => {
        alert(`${response.deletedCount} file(s) deleted successfully!`);
        this.selectedFiles.clear();
        this.selectAll = false;
        this.fetchFiles();
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete files');
    }
  }

  // Toggle file selection
  toggleFileSelection(fileId: string) {
    if (this.selectedFiles.has(fileId)) {
      this.selectedFiles.delete(fileId);
    } else {
      this.selectedFiles.add(fileId);
    }
  }

  // Toggle select all
  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedFiles.clear();
    } else {
      this.filteredFiles.forEach(file => {
        this.selectedFiles.add(file._id);
      });
    }
    this.selectAll = !this.selectAll;
  }

  // Check if file is selected
  isFileSelected(fileId: string): boolean {
    return this.selectedFiles.has(fileId);
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Track by function for better performance
  trackByFileId(index: number, file: any): string {
    return file._id;
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
