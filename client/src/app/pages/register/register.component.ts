import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerToken : string | undefined
  registerForm : FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    email: ['', Validators.email],
    password: ['', Validators.required]
  })

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private formBuilder : FormBuilder,
    private http : HttpClient,
    private _snackBar : MatSnackBar
    ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.registerToken = params['token']
    })
  }

  register(){
    console.log(this.registerForm.getRawValue())
    const requestBody = this.registerForm.getRawValue()
    let token = '' 
    if (this.registerToken){
      token = `jwt ${this.registerToken}`
    }
    this.http.post('http://localhost:3000/user/register', requestBody, {
      headers : {'authorization' : token}
    }).subscribe({
      next: (data) => {
        this.router.navigate(['login'])
      },
      error: (error) => {
        this._snackBar.open('Error', error.error.message, {
          duration: 3000
        })
      },
      complete: () => {}
    })
  }
}
