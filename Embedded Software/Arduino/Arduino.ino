#include <Servo.h>
#include <Wire.h>

const int SLEEP_DURATION = 260;

int lastState = 0;
int thisState = 0;

const int in0 = 2;
const int in1 = 4;
//const int in2 = 7;
const int in3 = 26;
const int in4 = 30; //Change this to 30 so that we can use the PWM for the barrier servo.
const int in5 = 22;
const int inToast = 24;
const int inRelease = 7;

const int toastRotate = 28;
const int toastDown = 27;

const int TOAST_SLEEP = 10000;

const int SLEEP[] = {0, 335, 590, 830, 1060, 1280};

bool madeToast = false;

Servo out0;
Servo out1;
Servo out2;
Servo out3;
Servo out4;
Servo out5;
Servo toastBarrier;
Servo button;

Servo out6; //This is the bidirectional one!

void processState(int bytes) {
  lastState = thisState;
  thisState = Wire.read();
  thisState -= 48;

  Serial.println("Got some data!"); 
  Serial.println(thisState);
  Serial.println(lastState);
  Serial.println("----");

}

void makeToast() {
  //digitalWrite(toastDown, HIGH);
  //delay(10000);
  //digitalWrite(toastDown, LOW);
  //delay(25000);
  digitalWrite(toastRotate, LOW);
  delay(10000);
  digitalWrite(toastRotate, HIGH);
  button.write(100);
  delay(500);
  button.write(135);
}

void setup() {
  Wire.begin(5);
  Wire.onReceive(processState);

  Serial.begin(9600);
  Serial.println("Hello!");

  pinMode(in0, INPUT_PULLUP);
  pinMode(in1, INPUT_PULLUP);
//  pinMode(in2, INPUT_PULLUP);
  pinMode(in3, INPUT_PULLUP);
  pinMode(in4, INPUT_PULLUP);
  pinMode(in5, INPUT_PULLUP);
  //pinMode(in6, INPUT_PULLUP);
  pinMode(inToast, INPUT_PULLUP);
  pinMode(inRelease, INPUT_PULLUP);

  pinMode(toastDown, OUTPUT);
  pinMode(toastRotate, OUTPUT);

  digitalWrite(toastRotate, HIGH);

  out0.attach(3);
  out0.write(90);

  out1.attach(5);
  out1.write(90);
  
//  out2.attach(6);
//  out2.write(90);

  out3.attach(9);
  out3.write(90);
  
  out4.attach(10);
  out4.write(87);
  
  out5.attach(11);
  out5.write(93);
  
  out6.attach(13);
  out6.write(90);

  toastBarrier.attach(12);
  toastBarrier.write(70);

  button.attach(6);
  button.write(135);

  digitalWrite(toastDown, LOW);

}

void loop() {
  // put your main code here, to run repeatedly:
  int val0 = digitalRead(in0);
  int val1 = digitalRead(in1);
//  int val2 = digitalRead(in2);
  int val3 = digitalRead(in3);
  int val4 = digitalRead(in4);
  int val5 = digitalRead(in5);
  int valToast = digitalRead(inToast);
  int valRelease = digitalRead(inRelease);

  if (valToast == HIGH) {
    makeToast();
  }

  if (valRelease == HIGH) {
    toastBarrier.write(0);
    delay(1000);
    toastBarrier.write(70);
  }

  if (val0 == HIGH) {
    out0.write(180);
    delay(SLEEP_DURATION);
    out0.write(90);
  }

  if (val1 == HIGH) {
    out1.write(180);
    delay(SLEEP_DURATION);
    out1.write(90 );
  }
  
//  if (val2 == HIGH) {
//    out2.write(180);
//    delay(SLEEP_DURATION);
//    out2.write(90 );
//  }
  if (val3 == HIGH) {
    out3.write(180);
    delay(SLEEP_DURATION);
    out3.write(90 );
  }
  if (val4 == HIGH) {
    out4.write(180);
    delay(SLEEP_DURATION);
    out4.write(90 );
  }
  if (val5 == HIGH) {
    out5.write(180);
    delay(SLEEP_DURATION);
    out5.write(93 );
  }

  if (lastState == thisState) {
    out6.write(90);
  } else{ 
    if (thisState > lastState) {
      out6.write(0);
      delay(SLEEP[thisState-lastState]);
      out6.write(90);
      Serial.println("Should've run the motor");
      Serial.println(thisState-lastState);
    } else {
      out6.write(180);
      delay(SLEEP[lastState-thisState]);
      out6.write(90);
    }
    
    lastState = thisState;
  }
}
