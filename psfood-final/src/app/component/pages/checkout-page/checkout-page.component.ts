import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { Order } from '../../../shared/models/order';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {
  order:Order = new Order();
  checkoutForm!: FormGroup;
  fc:{ [key: string]: FormControl } = {
    name: new FormControl(''), // Define as FormControl instance
    address: new FormControl('')
  };
  // formControls:{ [key: string]: FormControl } = {};
  constructor(private cartService:CartService,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private toastrService: ToastrService,
              private orderService: OrderService,
              private router: Router) {
    const cart = cartService.getCart();
    this.order.items = cart.items;
    this.order.totalPrice = cart.totalPrice;
  }

  ngOnInit(): void {
    let {name, address} = this.userService.currentUser;
    this.checkoutForm = this.formBuilder.group({
      name:[name ?? '', Validators.required],
      address:[address ?? '', Validators.required]
    });
    this.fc = this.checkoutForm.controls as { [key: string]: FormControl };
  }

  // get fc(){
  //   return this.checkoutForm.controls;
  // }

  createOrder(){
    if(this.checkoutForm.invalid){
      this.toastrService.warning('Please fill the inputs', 'Invalid Inputs');
      return;
    }

    if(!this.order.addressLatLng){
      this.toastrService.warning('Please select your location on the map', 'Location');
      return;
    }


    this.order.name = this.fc['name'].value;
    this.order.address = this.fc['address'].value;
    // this.order.name = this.checkoutForm.get('name')?.value;
    // this.order.address = this.checkoutForm.get('address')?.value;

    this.orderService.create(this.order).subscribe({
      next:() => {
        this.router.navigateByUrl('/payment-page');
      },
      error:(errorResponse) => {
        this.toastrService.error(errorResponse.error, 'Cart');
      }
    });
  }
}
