import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { FileService } from 'src/app/services/file.service';
import {
  selectEmployee,
  selectProfile,
} from 'src/app/store/employee/employee.selector';

@Component({
  selector: 'app-employee-personal-info',
  templateUrl: './employee-personal-info.component.html',
  styleUrls: ['./employee-personal-info.component.css'],
})
export class EmployeePersonalInfoComponent {
  constructor(
    private fileService: FileService,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {}
  username: string = 'aaron';
  personalInfoForm$: Observable<any> = this.store.select(selectProfile);
  editable: boolean = false;
  editable2: boolean = false;
  // personalInfoForm: FormGroup = this.formBuilder.group({
  //   firstName: [{ value: '', disabled: true }],
  //   lastName: [{ value: '', disabled: true }, ],
  //   middleName: [{ value: '', disabled: true }],
  //   preferredName: [{ value: '', disabled: true }],
  //   SSN: [{ value: '', disabled: true }, ],
  //   dateOfBirth: [{ value: '', disabled: true },],
  //   building: [{ value: '', disabled: true }, ],
  //   street: [{ value: '', disabled: true }, ],
  //   city: [{ value: '', disabled: true }, ],
  //   state: [{ value: '', disabled: true }, ],
  //   zip: [{ value: '', disabled: true }, ],
  //   cellphone: [{ value: '', disabled: true }, ],
  //   workphone: [{ value: '', disabled: true }, ],
  //   visatitle: [{ value: '', disabled: true }, ],
  //   start: [{ value: '', disabled: true }, ],
  //   end: [{ value: '', disabled: true }, ],
  //   efirstName: [{ value: 'yingji yan', disabled: true }],
  //   elastName: [{ value: '', disabled: true }],
  //   emiddleName: [{ value: '', disabled: true }],
  //   ephone: [{ value: 'yingji yan', disabled: true }],
  //   eemail: [{ value: '', disabled: true }],
  //   relationship: [{ value: '', disabled: true }, Validators.required],
  // });
  personalInfoForm: FormGroup = this.formBuilder.group({
    firstName: [{ value: '', disabled: true }, Validators.required],
    lastName: [{ value: '', disabled: true }, Validators.required],
    middleName: [{ value: '', disabled: true }],
    preferredName: [{ value: '', disabled: true }],
    SSN: [{ value: '', disabled: true }, Validators.required],
    gender:[{ value: '', disabled: true }],
    dateOfBirth: [{ value: '', disabled: true }, Validators.required],
    address: this.formBuilder.group({
      building: [{ value: '', disabled: true }, Validators.required],
      street: [{ value: '', disabled: true }, Validators.required],
      city: [{ value: '', disabled: true }, Validators.required],
      state: [{ value: '', disabled: true }, Validators.required],
      zip: [{ value: '', disabled: true }, Validators.required],
    }),
    cellPhoneNumber: [{ value: '', disabled: true }, Validators.required],
    workPhoneNumber: [{ value: '', disabled: true }],
    title: [{ value: '', disabled: true }, Validators.required],
    startDate: [{ value: '', disabled: true }, Validators.required],
    endDate: [{ value: '', disabled: true }, Validators.required],
    // efirstName: [{ value: '', disabled: true }, Validators.required],
    // elastName: [{ value: '', disabled: true }, Validators.required],
    // emiddleName: [{ value: '', disabled: true }],
    // ephone: [{ value: '', disabled: true }],
    // eemail: [{ value: '', disabled: true }, Validators.required],
    // relationship: [{ value: '', disabled: true }, Validators.required],
  });
  emergencyForm = this.formBuilder.group({
    emergencyContacts: this.formBuilder.array([
      this.formBuilder.group({
        firstName: [{ value: '', disabled: true }, Validators.required],
        lastName: [{ value: '', disabled: true }, Validators.required],
        middleName: [{ value: '', disabled: true }],
        phone: [{ value: '', disabled: true }],
        email: [{ value: '', disabled: true }, Validators.required],
        relationship: [{ value: '', disabled: true }, Validators.required],
      }),
    ]),
  });
  init() {
    this.personalInfoForm.disable();
  }
  initAddress() {
    return this.formBuilder.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      middleName: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, Validators.required],
      relationship: [{ value: '', disabled: true }, Validators.required],
    });
}
  ngOnInit() {}
  getControls() {
    return (this.emergencyForm.get('emergencyContacts') as FormArray).controls;
  }
  getLength(){
    return (this.emergencyForm.get('emergencyContacts') as FormArray).length>1;
  }
  addAddress() {
    const control = <FormArray>this.emergencyForm.get('emergencyContacts');
    control.push(this.initAddress());
}
removeAddress(i: number) {
    const control = <FormArray>this.emergencyForm.get('emergencyContacts');
    control.removeAt(i);
}
  edit() {
    this.editable = true;
    this.personalInfoForm.enable();
  }
  cancel() {
    this.editable = false;
    // this.personalInfoForm.reset();
    this.personalInfoForm.disable();
  }
  editEC() {
    this.editable2 = true;
    this.emergencyForm.enable();
  }
  cancelEC() {
    this.editable2 = false;
    // this.emergencyForm.reset();
    this.emergencyForm.disable();
  }
  save(): void {
    this.editable = false;
    // console.log(this.personalInfoForm.getRawValue());
    this.personalInfoForm.disable();
    const token = window.localStorage.getItem('JWT_TOKEN');
    console.log(token);
    const headers = new Headers({
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    });
    this.http
      .post('http://localhost:3000/user/profile', {
        headers: headers,
        profileData: this.personalInfoForm.getRawValue(),
      })
      .subscribe((res: any) => {
        console.log(res.message);
      });
  }
  saveEC(): void {
    this.editable2 = false;
    // console.log(this.emergencyForm.getRawValue());
    this.emergencyForm.disable();
    const token = window.localStorage.getItem('JWT_TOKEN');
    console.log(token);
    const headers = new Headers({
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    });
    this.http
      .post('http://localhost:3000/user/emergencyContact_update', {
        headers: headers,
        profileData: this.emergencyForm.getRawValue(),
      })
      .subscribe((res: any) => {
        console.log(res.message);
      });
  }
}
