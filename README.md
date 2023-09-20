# @themost/form-renderer

Form renderer component wrapper for [angular@5 to angular@15](https://angular.io/) and [formio.js](https://github.com/formio/formio.js)

## Usage

    npm i @themost/form-renderer

Import `FormRendererModule` in your `AppModule`

    @NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormRendererModule
    ],
    providers: [],
    bootstrap: [AppComponent]
    })
    export class AppModule { }

Include `formio.form.min.js` in `scripts` section (+ formio.form.css in `styles` section) of `angular.json`

    ...
    "architect": {
        "build": {
          ...
          "options": {
            ...
            "styles": [
              "node_modules/formiojs/dist/formio.form.css",
              "src/styles.css"
            ],
            "scripts": [
              "node_modules/formiojs/dist/formio.form.min.js"
            ]
          },

**Important note**: This operation is very important in order to resolve backward compatibility issues visible when you are using older versions of @angular






