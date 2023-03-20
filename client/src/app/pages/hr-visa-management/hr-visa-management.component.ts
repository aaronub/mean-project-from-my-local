import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/interfaces/employee';
import { FileService } from 'src/app/services/file.service';
import { Observable, catchError, of } from 'rxjs';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { RejectDialogComponent } from 'src/app/components/reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-hr-visa-management',
  templateUrl: './hr-visa-management.component.html',
  styleUrls: ['./hr-visa-management.component.css'],
})
export class HrVisaManagementComponent {
  nextStep = {
    0: 'submit onboarding application',
    1: 'wait for HR approval',
    2: 'submit OPT EAD',
    3: 'wait for HR approval',
    4: 'submit I-983',
    5: 'wait for HR approval',
    6: 'submit I-20',
    7: 'wait for HR approval',
  };
  constructor(
    private fileService: FileService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialog: MatDialog
  ) { }
  getStep(step: number | string): string | number {
    // console.log(step);
    return this.nextStep[step as keyof typeof this.nextStep];
  }
  isStep(step: number): boolean {
    return step % 2 === 1;
  }
  searchForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
  });
  profiles: any[] = [];
  allProfiles: any[] = [];
  fileList: any[] = [];
  allFileList: any[] = [];
  visa = ["p.optReceipt", "p.optEAD", "p.i983", "p.i20"]
  ngOnInit() {
    fetch(`http://localhost:3000/hr/inProgressVisas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoxLCJlbWFpbCI6ImRhejAwNEB1Y3NkLmVkdSIsImlhdCI6MTY3ODE1NTE1MywiZXhwIjoxNjc4MTY1OTUzfQ.QRtihBwAhBvidh4scWNEv6GdiJY0AcgkxXPy7UNr_0g',
      },
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((res) => {
        this.profiles = res.data;
      })
      .then((res) => {
        this.getDocumnt();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    fetch(`http://localhost:3000/hr/visas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoxLCJlbWFpbCI6ImRhejAwNEB1Y3NkLmVkdSIsImlhdCI6MTY3ODE1NTE1MywiZXhwIjoxNjc4MTY1OTUzfQ.QRtihBwAhBvidh4scWNEv6GdiJY0AcgkxXPy7UNr_0g',
      },
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((res) => {
        this.allProfiles = res.data;
      })
      .then((res) => {
        this.getAllDocumnts();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  sendNotification(name: string, email: string, nextstep: number) {
    console.log(email);
    console.log(nextstep);
    
    fetch(`http://localhost:3000/hr/sendNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoxLCJlbWFpbCI6ImRhejAwNEB1Y3NkLmVkdSIsImlhdCI6MTY3ODE1NTE1MywiZXhwIjoxNjc4MTY1OTUzfQ.QRtihBwAhBvidh4scWNEv6GdiJY0AcgkxXPy7UNr_0g',
      },
      body: JSON.stringify({ name: name, email: email, nextstep: nextstep }),
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((res) => {
        // this.profiles = res.data;
        console.log(res);
        alert("send notification successfully!")
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  approve(pid: string, next: number, i: number) {
    console.log(pid);
    console.log('next =', next)
    fetch(`http://localhost:3000/hr/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoxLCJlbWFpbCI6ImRhejAwNEB1Y3NkLmVkdSIsImlhdCI6MTY3ODE1NTE1MywiZXhwIjoxNjc4MTY1OTUzfQ.QRtihBwAhBvidh4scWNEv6GdiJY0AcgkxXPy7UNr_0g',
      },
      body: JSON.stringify({ pid: pid, nextStep: next + 1 }),
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((res) => {
        console.log(res);
        this.profiles[i].nextStep++;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  // reject(pid: string, next: number) {
  //   fetch(`http://localhost:3000/hr/a`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       authorization:
  //         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoxLCJlbWFpbCI6ImRhejAwNEB1Y3NkLmVkdSIsImlhdCI6MTY3ODE1NTE1MywiZXhwIjoxNjc4MTY1OTUzfQ.QRtihBwAhBvidh4scWNEv6GdiJY0AcgkxXPy7UNr_0g',
  //     },
  //     body: JSON.stringify({ pid: pid }),
  //   })
  //     .then((response) => {
  //       console.log(response);
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       return response.json();
  //     })
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error);
  //     });
  // }
  getDocumnt() {
    this.fileList = this.profiles.map((p) => {
      switch (p.nextStep) {
        case 1:
          return p.optReceipt;
        case 3:
          return p.optEAD;
        case 5:
          return p.i983;
        case 7:
          return p.i20;
        default:
          return '';
      }
    });
  }
  getAllDocumnts() {
    this.allFileList = this.profiles.map((p) => {
      let list = new Array();
      if (p.nextStep < 2) {
        list.push(p.optReceipt);
      }
      if (p.nextStep < 4) {
        // if(p.optEAD)
        list.push(p.optEAD);
      }
      if (p.nextStep < 6) {
        // if(p.i983)
        list.push(p.i983);
      }
      if (p.nextStep < 8) {
        // if(p.i20)
        list.push(p.i20);
      }
      return [...list];
    });
    console.log(this.allFileList)
  }
  // const response = this.fileService.fileListService();
  // response.pipe(catchError((err) => of([{ err }]))).subscribe((file: any) => {
  //   console.log('file=', file)
  //   const userFile = [...file].filter((elem: any) => {
  //     if (dlist.includes(elem)) {
  //       console.log('inside filter true');
  //       return true;
  //     }
  //     console.log('inside filter false');
  //     return false;
  //   });
  //   const userFile = new Array();
  //   this.fileList = userFile;
  //   console.log(dlist);
  // });

  openDialog(pid: string, nextStep: number, i: number): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      data: { pid: pid, nextStep: nextStep },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        this.profiles[i].nextStep--;
      }
      // alert(result)
    });
  }
  // search(type: string) {
  //   this.profiles = 
  // }
}
