import { EventEmitter, AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { set } from 'lodash';
declare var Formio: any;

@Component({
  selector: 'form-renderer',
  template: `
  <div #form></div>
  `
})
export class FormRendererComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('form') formElement: ElementRef;

  @Input() form: any;
  @Input() submission: any = {
    data: {}
  };

  // https://help.form.io/developers/form-development/form-renderer#form-renderer-options

  @Input()  renderOptions?: {
    readOnly?: boolean; // false
    noDefaults?: boolean; // false
    language?: string;
    i18n?: any;
    viewAsHtml?: boolean;
    highlightErrors?: boolean; // true
    componentErrorClass?: string // formio-error-wrapper
  } | any;

  @Input() execute: (submission: any, saved?: boolean) => Promise<void>;

  @Input() refresh: EventEmitter<{ form?: any, property?: string, value?: any }>;
  @Input() error: EventEmitter<object>;

  // @Output() submit = new EventEmitter<{ data: any, metadata: any, state: string }>(null);
  @Output() change = new EventEmitter<any>(null);
  @Output() formLoad = new EventEmitter<any>(null);
  @Output() ready = new EventEmitter<any>(null);
  @Output() submitDone = new EventEmitter<any>(null);
  @Output() customEvent = new EventEmitter<{ type: string, component: any, data: any, event: UIEvent }>(null);

  public instance: any;
  private refreshSubscription: Subscription;
  private errorSubscription: Subscription;

  constructor() {
    //
  }
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.form && changes.form.currentValue) {
      if (this.instance) {
        this.instance.setForm(this.form);
      } else {
        this.createForm(this.form);
      }
    }
    if (changes.refresh) {
      if (this.refresh) {
        this.refreshSubscription = this.refresh.subscribe((event: { form?: any, property?: string, value?: any }) => {
          if (event.form) {
            this.instance.setForm(event.form);
          } else if (event.property) {
            set(this.instance, event.property, event.value);
          }
        });
      } else {
        if (this.refreshSubscription) {
          this.refreshSubscription.unsubscribe();
        }
      }
    }

    if (changes.error) {
      if (this.error) {
        this.errorSubscription = this.error.subscribe((error?: any) => {
          this.instance.error = error;
          this.instance.setAlert('danger', error);
        });
      } else {
        if (this.errorSubscription) {
          this.errorSubscription.unsubscribe();
        }
      }
    }
  }

  private createForm(jsonForm: any) {
    Formio.createForm(this.formElement.nativeElement, jsonForm, this.renderOptions).then((created: any) => {
      this.instance = created;
      this.instance.setSubmission(this.submission);

      this.instance.ready.then(() => {
        this.instance.nosubmit = true;
        this.formLoad.emit();
        this.ready.emit();
      });

      this.instance.onSubmit = (submission: any, saved: boolean = false) => {
        if (this.execute == null) {
          this.instance.submitted = this.instance.submitting = false;
          this.instance.setAlert('danger', 'Submission process has not been defined');
          return;
        }
        return this.execute(submission, saved).then(() => {
          this.instance.submitted = true;
          this.instance.submitting = false;
          const i18next = this.instance.i18next;
          this.instance.setAlert('success', i18next.t('complete'));

          this.instance.emit('submitDone', submission);
        }).catch((error) => {
          this.instance.submitted = this.instance.submitting = false;
          this.instance.setAlert('danger', error.message);
          this.instance.emit('submitError', error);
        });
      };

      // this.instance.on('submit', (event: { data: any, metadata: any, state: string }) => {
      //   this.submit.emit(event);
      // }, true);

      this.instance.on('customEvent', (event: { type: string, component: any, data: any, event: UIEvent }) => {
        this.customEvent.emit(event);
      }, true);

      this.instance.on('submitDone', (event: { type: string, component: any, data: any, event: UIEvent }) => {
        this.submitDone.emit(event);
      }, true);

      this.instance.on('change', (event: any) => {
        this.change.emit(event);
      }, true);
    }).catch((error: any) => {
      console.error(error);
    });
  }

  ngAfterViewInit(): void {
    //
  }

  ngOnInit() {
  }

}
