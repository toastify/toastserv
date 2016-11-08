//Created with the Particle IDE. http://build.particle.io/

// This #include statement was automatically added by the Particle IDE.
#include "SparkJson/SparkJson.h"
#include "application.h"
//#include <Wire.h>

Servo servo;
int currPos = 0;

int compartment0 = D2;
int compartment1 = D3;
int compartment4 = D6;
int compartment5 = D7;

int toastSignal = D4;
int releaseSignal = D5;

// const int SLEEP_0 = 0;
// const int SLEEP_1 = 160;
// const int SLEEP_2 = 365;
// const int SLEEP_3 = 580;
// const int SLEEP_4 = 815;
// const int SLEEP_5 = 1050;

// const int SLEEP[] = {SLEEP_0, SLEEP_1, SLEEP_2, SLEEP_3, SLEEP_4, SLEEP_5};

void setup() { 
    Wire.begin();
    pinMode(compartment0, OUTPUT);
    digitalWrite(compartment0, LOW);
    pinMode(compartment1, OUTPUT);
    digitalWrite(compartment1, LOW);
    pinMode(toastSignal, OUTPUT);
    digitalWrite(toastSignal, LOW);
    //pinMode(compartment3, OUTPUT);
    //digitalWrite(compartment3, LOW);
    pinMode(compartment4, OUTPUT);
    digitalWrite(compartment4, LOW);
    pinMode(compartment5, OUTPUT);
    digitalWrite(compartment5, LOW);
    pinMode(releaseSignal, OUTPUT);
    digitalWrite(releaseSignal, LOW);
    //servo.attach(servoPin, 771, 1798);
    //Particle.function("servo", controlServo);
    //Particle.variable("currPos", &currPos, INT);
    //Particle.function("compartment", compartment);
    //servo.write(0);
    //analogWrite(A4, 0);
    Particle.function("toast", makeSandwich);
}

void loop() {
}


void controlServo(int n) {
    
    Wire.beginTransmission(5);
    char snum[1];
    Wire.write(itoa(n, snum, 10));
    Wire.endTransmission();
}

void compartment(int cmd) {
    if (cmd == 0) {
        digitalWrite(compartment0, HIGH);
        delay(400);
        digitalWrite(compartment0, LOW);
    } else if (cmd == 1) {
        digitalWrite(compartment1, HIGH);
        delay(400);
        digitalWrite(compartment1, LOW);
//    } else if (cmd == "2") {
//        digitalWrite(compartment2, HIGH);
//        delay(700);
//        digitalWrite(compartment2, LOW);
//    } else if (cmd == "3") {
//        digitalWrite(compartment3, HIGH);
//        delay(700);
//        digitalWrite(compartment3, LOW);
    } else if (cmd == 4) {
        digitalWrite(compartment4, HIGH);
        delay(400);
        digitalWrite(compartment4, LOW);
    } else if (cmd == 5) {
        digitalWrite(compartment5, HIGH);
        delay(400);
        digitalWrite(compartment5, LOW);
    }
}

int makeSandwich(String cmd) {
    char str[cmd.length() + 1];
    cmd.toCharArray(str, cmd.length() + 1);
    
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(str);
    
    int len = (int) root["length"];
    
    digitalWrite(toastSignal, HIGH);
    delay(600);
    digitalWrite(toastSignal, LOW);
    delay(11400);
    
    //controlServo(5);
    //delay(5000);
    
    for (int i=0; i<len; i++) {
        controlServo(root["data"][i]);
        delay(1500);
        compartment(root["data"][i]);
        delay(1000);
    }
    
    digitalWrite(releaseSignal, HIGH);
    delay(1000);
    digitalWrite(releaseSignal, LOW);
    return 0;
}

/*
// This #include statement was automatically added by the Particle IDE.
#include "SparkJson/SparkJson.h"
#include "application.h"
#include <math.h>
//#include <Wire.h>

Servo servo;

int compartment0 = D2;
int compartment1 = D3;
int compartment2 = D4;
int compartment3 = D5;
int compartment4 = D6;
int compartment5 = D7;

const int SLEEP_TIME = 3000;

// const int SLEEP_0 = 0;
// const int SLEEP_1 = 160;
// const int SLEEP_2 = 365;
// const int SLEEP_3 = 580;
// const int SLEEP_4 = 815;
// const int SLEEP_5 = 1050;

//const int SLEEP[] = {SLEEP_0, SLEEP_1, SLEEP_2, SLEEP_3, SLEEP_4, SLEEP_5};

void setup() { 
    pinMode(compartment0, OUTPUT);
    digitalWrite(compartment0, LOW);
    pinMode(compartment1, OUTPUT);
    digitalWrite(compartment1, LOW);
    pinMode(compartment2, OUTPUT);
    digitalWrite(compartment2, LOW);
    pinMode(compartment3, OUTPUT);
    digitalWrite(compartment3, LOW);
    pinMode(compartment4, OUTPUT);
    digitalWrite(compartment4, LOW);
    pinMode(compartment5, OUTPUT);
    digitalWrite(compartment5, LOW);
    //servo.attach(servoPin, 771, 1798);
    //Particle.function("servo", makeASandwich);
    //Particle.variable("currPos", &currPos, INT);
    Particle.function("compartment", compartment);
    //servo.write(0);
    //analogWrite(A4, 0);
    //Wire.begin();
}

void loop() {
    digitalWrite(compartment0, LOW);
}


// int controlServo(int n) {
    
//     Wire.beginTransmission(5);
//     char snum[1];
//     Wire.write(itoa(n, snum, 10));
//     Wire.endTransmission();
    
//     return 1;
// }

// int compartment(int cmd) {
//     if (cmd == 0) {
//         digitalWrite(compartment0, HIGH);
//         delay(700);
//         digitalWrite(compartment0, LOW);
//     } else if (cmd == 1) {
//         digitalWrite(compartment1, HIGH);
//         delay(700);
//         digitalWrite(compartment1, LOW);
//     } else if (cmd == 2) {
//         digitalWrite(compartment2, HIGH);
//         delay(700);
//         digitalWrite(compartment2, LOW);
//     } else if (cmd == 3) {
//         digitalWrite(compartment3, HIGH);
//         delay(700);
//         digitalWrite(compartment3, LOW);
//     } else if (cmd == 4) {
//         digitalWrite(compartment4, HIGH);
//         delay(700);
//         digitalWrite(compartment4, LOW);
//     } else if (cmd == 5) {
//         digitalWrite(compartment5, HIGH);
//         delay(700);
//         digitalWrite(compartment5, LOW);
//     }
//     return 0;
// }

int compartment(String cmd) {
    if (cmd == "0") {
        digitalWrite(compartment0, HIGH);
        delay(700);
        digitalWrite(compartment0, LOW);
    } else if (cmd == "1") {
        digitalWrite(compartment1, HIGH);
        delay(700);
        digitalWrite(compartment1, LOW);
    } else if (cmd == "2") {
        digitalWrite(compartment2, HIGH);
        delay(700);
        digitalWrite(compartment2, LOW);
    } else if (cmd =="3") {
        digitalWrite(compartment3, HIGH);
        delay(700);
        digitalWrite(compartment3, LOW);
    } else if (cmd == "4") {
        digitalWrite(compartment4, HIGH);
        delay(700);
        digitalWrite(compartment4, LOW);
    } else if (cmd == "5") {
        digitalWrite(compartment5, HIGH);
        delay(700);
        digitalWrite(compartment5, LOW);
    }
    return 0;
}

// int makeASandwich(String cmd) {
//     char str[cmd.length() + 1];
//     cmd.toCharArray(str, cmd.length() + 1);
    
//     StaticJsonBuffer<200> jsonBuffer;
//     JsonObject& root = jsonBuffer.parseObject(str);
    
//     int i=0;
//     while (sizeof(root["toppings"][i]) == sizeof(1) && !isnan(root["toppings"][i])) {
//         controlServo(root["toppings"][i]);
//         delay(1500);
//         compartment(root["toppings"][i]);
        
//     }
    
//     // if (root["toppings"])
//     // {
//     //     int toppings[root["toppings"].size()] = root["toppings"];
//     // }
    
//     // for (int i=0; i<toppings.length(); i++) {
//     //     controlServo(i);
//     //     delay(1500);
//     //     compartment(i);
//     // }
    
//     return 1;
    
// }*/