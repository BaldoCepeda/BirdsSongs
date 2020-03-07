import { Component, OnInit, ViewChild } from '@angular/core';
import { CSVRecord } from './CSVModel';  
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-birdsLocation',
  templateUrl: './birdsLocation.component.html',
  styleUrls: ['./birdsLocation.component.css']
})
export class BirdsLocationComponent implements OnInit {

  httpClient : HttpClient;
  sanitizer : DomSanitizer
  apiKey = "AIzaSyDrAlG18NEimeuX7iLAxqr_YjH1RlOKKrY";
  lat: number = 50.7932;
  long: number = 15.4995;
  sourceMap: SafeUrl;

  myControl = new FormControl();
  filteredOptions: Observable<CSVRecord[]>;

  displayedColumns: string[] = ["file_id","genus","species","english_cname","who_provided_recording","country","latitude","longitute","type"];

  public records: CSVRecord[] = [];
  @ViewChild('csvReader', {static: false}) csvReader: any;

  constructor(http: HttpClient, sanitizer: DomSanitizer) {
    this.httpClient = http;
    this.sanitizer = sanitizer;
  }

  ngOnInit() {
    this.sourceMap = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed/v1/view?key=" + this.apiKey + "&zoom=13&maptype=satellite&center=" + this.lat + "," + this.long);
    // this.httpClient.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=" + this.apiKey);
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.species),
        map(species => species ? this._filter(species) : this.records.slice())
      );
  }

  displayFn(record: CSVRecord): string {
    return record && record.file_id ? record.file_id : '';
  }

  private _filter(name: string): CSVRecord[] {
    const filterValue = name.toLowerCase();

    return this.records.filter(option => option.file_id.toLowerCase().indexOf(filterValue) === 0);
  }
  
  uploadListener($event: any): void {
  
    let text = [];
    let files = $event.srcElement.files;
  
    if (this.isValidCSVFile(files[0])) {
  
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
        this.filteredOptions.pipe(map(birdList =>{
          this.records.forEach(element => {
            birdList.push(element);
          });
        }));
      };
  
      reader.onerror = function () {
        console.log('error is occured while reading file!');
      };
  
    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }  
  }  
  
  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];
  
    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        let csvRecord: CSVRecord = new CSVRecord();
        csvRecord.file_id = curruntRecord[0].trim();
        csvRecord.genus = curruntRecord[1].trim();
        csvRecord.species = curruntRecord[2].trim();
        csvRecord.english_cname = curruntRecord[3].trim();
        csvRecord.who_provided_recording = curruntRecord[4].trim();
        csvRecord.country = curruntRecord[5].trim();
        csvRecord.latitude = parseFloat(curruntRecord[6].trim());
        csvRecord.longitute = parseFloat(curruntRecord[7].trim());
        csvRecord.type = curruntRecord[8].trim();
        csvArr.push(csvRecord);  
      }  
    }  
    return csvArr;  
  }  
  
  isValidCSVFile(file: any) {  
    return file.name.endsWith(".csv");  
  }  
  
  getHeaderArray(csvRecordsArr: any) {  
    let headers = (<string>csvRecordsArr[0]).split(',');  
    let headerArray = [];  
    for (let j = 0; j < headers.length; j++) {  
      headerArray.push(headers[j]);  
    }  
    return headerArray;  
  }  
  
  fileReset() {  
    this.csvReader.nativeElement.value = "";  
    this.records = [];  
  }

  onSearchChange(event: MatAutocompleteSelectedEvent){
    console.log(event.option.value);
    this.sourceMap = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed/v1/view?key=" + this.apiKey + "&zoom=13&maptype=satellite&center=" + event.option.value.latitude + "," + event.option.value.longitute);
  }

  onSearchClicked(row: any){
    console.log(row.file_id);
    this.sourceMap = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed/v1/view?key=" + this.apiKey + "&zoom=13&maptype=satellite&center=" + row.latitude + "," + row.longitute);
  }

  rowSelected(row: any){
    console.log(row.file_id);
    this.onSearchClicked(row);
  }

}
