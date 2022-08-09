import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Directory, Encoding, FileInfo, Filesystem, ReaddirResult, WriteFileResult } from '@capacitor/filesystem';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  listResult: ReaddirResult;
  modalOpen = false;
  modalTitle: string;
  imgSrc: SafeResourceUrl;
  imageUrl = 'https://ph-prod.imgix.net/wp-content/uploads/2019/06/06153013/plain-shipping-boxes-packhelp-kva.jpg';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.readFiles();
  }

  async download() {
    const data = await this.imageUrlToBase64(this.imageUrl);
    console.log(`Fetched ${data.length} bytes`);
    const uri = await this.write(`image${this.random(1, 10000)}.jpg`, data);
    console.log(`Wrote ${uri}`);
    this.readFiles();
  }

  async imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((onSuccess, onError) => {
      try {
        const reader = new FileReader();
        reader.onload = function() { onSuccess(this.result as string); };
        reader.readAsDataURL(blob);
      } catch (e) {
        onError(e);
      }
    });
  }


  async write(name: string, data: string): Promise<string> {
    console.log(`${name}=${data}`);
    const result: WriteFileResult = await Filesystem.writeFile({
      path: name,
      data,
      directory: Directory.Documents
    });
    return result.uri;
  }

  async readFiles() {
    const result: ReaddirResult = await Filesystem.readdir({
      path: '',
      directory: Directory.Documents
    });
    this.listResult = result;
  }

  async open(file: FileInfo) {
    try {
      const readFile = await Filesystem.readFile({
        path: file.uri
      });

      const b64 = readFile.data;
      this.modalTitle = file.name;
      this.imgSrc =
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpeg;base64, ${b64}`);
      this.modalOpen = true;
    } catch (err) {
      alert(err + `(${file.uri})`);
    }

  }

  random(min = 0, max = 100) {
    const difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    return rand + min;
  }

}
