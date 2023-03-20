import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';
import { catchError, of } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-hr-application-detail',
  templateUrl: './hr-application-detail.component.html',
  styleUrls: ['./hr-application-detail.component.css']
})
export class HrApplicationDetailComponent implements OnInit {
  employee: any;
  profile: any;
  feedback: string = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const employeeId = this.route.snapshot.paramMap.get('id');
    this.http.get('http://localhost:3000/hr/employee/' + employeeId)
      .subscribe((res: any) => {
        this.employee = res.data;
        this.profile = this.employee.profile;
        if (this.profile.pic)
        this.documentsList = { ...this.documentsList, picture: this.profile.pic };
      if (this.profile.driverLicense&&this.profile.driverLicense.document)
        this.documentsList = {
          ...this.documentsList,
          driverLicense: this.profile.driverLicense.document,
        };
      if (this.profile.optReceipt)
        this.documentsList = {
          ...this.documentsList,
          optReceipt: this.profile.optReceipt,
        };
      if (this.profile.optEAD)
        this.documentsList = {
          ...this.documentsList,
          optEAD: this.profile.optEAD,
        };
      if (this.profile.i20)
        this.documentsList = { ...this.documentsList, i20: this.profile.i20 };
      if (this.profile.i983)
        this.documentsList = { ...this.documentsList, i983: this.profile.i983 };
        console.log(this.documentsList)
      });
  }
  showDocuments = false
  documentsList: {} = {};
  showFileList(){
    this.showDocuments = !this.showDocuments
  }
  // showFileList() {
  //   if (profile.pic)
  //   this.documentsList = { ...this.documentsList, picture: profile.pic };
  // if (profile.driverLicense&&profile.driverLicense.document)
  //   this.documentsList = {
  //     ...this.documentsList,
  //     driverLicense: profile.driverLicense.document,
  //   };
  // if (profile.optReceipt)
  //   this.documentsList = {
  //     ...this.documentsList,
  //     optReceipt: profile.optReceipt,
  //   };
  // if (profile.optEAD)
  //   this.documentsList = {
  //     ...this.documentsList,
  //     optEAD: profile.optEAD,
  //   };
  // if (profile.i20)
  //   this.documentsList = { ...this.documentsList, i20: profile.i20 };
  // if (profile.i983)
  //   this.documentsList = { ...this.documentsList, i983: profile.i983 };
  //   console.log(this.documentsList)
  // }

  onApprove(): void {
    const requestBody = { id: this.employee._id };
    this.http.put('http://localhost:3000/hr/approveApplication', requestBody)
      .subscribe({
        next: (res: any) => {
          this._snackBar.open(res.message, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 1000,
          })
          this.router.navigate(['hrHiringManagement']);
        },
        error: (e) => {
          alert(e.error.message);
        }
      })
  }

  onReject(): void {
    const requestBody = { id: this.employee._id, feedback: this.feedback };
    this.http.put('http://localhost:3000/hr/rejectApplication', requestBody)
      .subscribe({
        next: (res: any) => {
          this._snackBar.open(res.message, '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 1000,
          })
          this.router.navigate(['hrHiringManagement']);
        },
        error: (e) => {
          alert(e.error.message);
        }
      })
  }
}
