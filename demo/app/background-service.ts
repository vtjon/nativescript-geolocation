import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import * as application from "tns-core-modules/application";
import { device } from "tns-core-modules/platform";
import * as Toast from "nativescript-toast";

let watchId;
application.on(application.exitEvent, function (args: any) {
    if (watchId) {
        geolocation.clearWatch(watchId);
    }
});

if (application.android) {
    if (device.sdkVersion < "26") {
        (<any>android.app.Service).extend("com.nativescript.location.BackgroundService", {
            onStartCommand: function (intent, flags, startId) {
                this.super.onStartCommand(intent, flags, startId);
                return android.app.Service.START_STICKY;
            },
            onCreate: function () {
                let that = this;
                geolocation.enableLocationRequest().then(function () {
                    that.id = geolocation.watchLocation(
                        function (loc) {
                            if (loc) {
                                let toast = Toast.makeText('Background Location: ' + loc.latitude + ' ' + loc.longitude);
                                toast.show();
                                console.log('Background Location: ' + loc.latitude + ' ' + loc.longitude);
                            }
                        },
                        function (e) {
                            console.log("Background watchLocation error: " + (e.message || e));
                        },
                        {
                            desiredAccuracy: Accuracy.high,
                            updateDistance: 0.1,
                            updateTime: 3000,
                            minimumUpdateTime: 100
                        });
                }, function (e) {
                    console.log("Background enableLocationRequest error: " + (e.message || e));
                });
            },
            onBind: function (intent) {
                console.log("on Bind Services");
            },
            onUnbind: function (intent) {
                console.log('UnBind Service');
            },
            onDestroy: function () {
                console.log('service onDestroy');
                geolocation.clearWatch(this.id);
            }
        });
    }
    else {
        (<any>android.app).job.JobService.extend("com.nativescript.location.BackgroundService26", {
            onStartJob(params) {
                let executed = false;
                geolocation.enableLocationRequest().then(function () {
                    watchId = geolocation.watchLocation(
                        function (loc) {
                            if (loc) {
                                let toast = Toast.makeText('Background Location: ' + loc.latitude + ' ' + loc.longitude);
                                toast.show();
                                console.log('Background Location: ' + loc.latitude + ' ' + loc.longitude);
                            }
                            executed = true;
                        },
                        function (e) {
                            console.log("Background watchLocation error: " + (e.message || e));
                            executed = true;
                        },
                        {
                            desiredAccuracy: Accuracy.high,
                            updateDistance: 0.1,
                            updateTime: 3000,
                            minimumUpdateTime: 100
                        });
                }, function (e) {
                    console.log("Background enableLocationRequest error: " + (e.message || e));
                });

                return executed;
            },

            onStopJob() {
                console.log('service onStopJob');
                geolocation.clearWatch(watchId);
                return true;
            },
        });
    }
}
