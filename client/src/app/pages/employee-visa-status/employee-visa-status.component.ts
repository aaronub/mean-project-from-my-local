import { Component, OnInit } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { FileService } from "../../services/file.service";
import { Store } from "@ngrx/store";
import { EmployeeAction } from 'src/app/store/employee/employee.action';
import { selectEmployee } from "../../store/employee/employee.selector";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-visa-status',
  templateUrl: './employee-visa-status.component.html',
  styleUrls: ['./employee-visa-status.component.css']
})
export class EmployeeVisaStatusComponent implements OnInit {

  users$: Observable<any> = this.store.select(selectEmployee);
  constructor(private fileService: FileService, private store: Store, private http: HttpClient) { }

  ngOnInit(): void {
    const token = window.localStorage.getItem('JWT_TOKEN');
    console.log(token)
    const headers = new Headers({
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    });
    fetch('http://localhost:3000/user/getEmployeeInfo', {
      method: 'GET',
      headers
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('data =', data)
        const employeeInfo = data.user
        this.store.dispatch(EmployeeAction.setEmployeeInfo({ employeeInfo }))
      })

    this.users$
      .pipe(catchError((err) => of([{ err }])))
      .subscribe((user: any) => {
        if (user) {
          console.log('inside this.users$')
          this.username = user.username
          if (user.profile) {
            this.next = user.profile.nextStep;
            if( user.profile.documentFeedback)
            this.fb = user.profile.documentFeedback;
          }
        }
      })
  }

  nextStep = {
    0: "submit onboarding application",
    1: "wait for HR approval",
    2: "submit OPT EAD",
    3: "wait for HR approval",
    4: "submit I-983",
    5: "wait for HR approval",
    6: "submit I-20",
    7: "wait for HR approval",
  };
  next = 1; //get from profile.nextStep;
  fb = "no feedback yet."
  getStep(step: number | string): string | number {
    return this.nextStep[step as keyof typeof this.nextStep];
  }

  optEAD: String = ''
  i983: String = '';
  i20: String = '';
  username: String = '';


  fileObj: any;
  onFilePicked(event: any): void {
    // console.log('event.target.name=', event.target.name)
    const inputName = event.target.name
    const FILE = event.target.files[0];
    this.fileObj = FILE;
    console.log('FILE.name =', FILE.name)
    if (inputName === 'optEAD') {
      this.optEAD = FILE.name
    }
    if (inputName === 'i983') {
      this.i983 = FILE.name
    }
    if (inputName === 'i20') {
      this.i20 = FILE.name
    }
    // //Not working this way????
    // this[fileName] = FILE.name
  }


  onFileUpload(event: any) {
    event.target.disabled = true;
    const fileForm = new FormData();
    fileForm.append('file', this.fileObj);
    console.log('imageForm=', fileForm)
    this.fileService.fileUpload(fileForm)
      .pipe(catchError((err) => of([{ err }])))
      .subscribe((fileName: any) => {
        console.log('fileName =', fileName[0])
        console.log('this.username =', this.username)
        window.alert('File uploaded')
        window.location.reload()

      })

    this.http.put('http://localhost:3000/user/employeeVisa',
      { username: this.username, optEAD: this.optEAD, i983: this.i983, i20: this.i20 })
      .subscribe((profile: any) => {
        console.log('profile =', profile)
      });


    // fetch('http://localhost:3000/user/employeeVisa', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ username: this.username, optEAD: this.optEAD, i983: this.i983, i20: this.i20 })
    // })

  }

}
