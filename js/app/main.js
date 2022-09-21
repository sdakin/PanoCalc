requirejs.config({
    "baseUrl": "js",

    "paths": {
        "jquery": "../xlib/jquery-3.6.0.min",
        "jquery-ui": "../xlib/jquery-ui-1.12.1.min",
        "bootstrap": "../xlib/tbs/js/bootstrap.bundle.min"
    },

    // jquery and its plugins are not require modules: this is the way to mimic that.
    // See <https://github.com/requirejs/example-jquery-shim/blob/master/www/js/app.js>
    "shim": {
        "bootstrap": ["jquery"],
        "jquery-ui": ["jquery"]
    }
});

define(["bootstrap", "jquery-ui"], function () {
    "use strict";

    $('#inputView').on('input', function (e) {
        // console.log($(e.currentTarget).val());
    });

    // $("#angleOfViewInfo").click( () => {
    //     debugger;
    // });
    $("#angleOfViewInfo").click(() => {
        $("#angleOfViewInfo").blur();
    });

    var aspectRatios = ["1 x 1,(1.00)", "4 x 5,(1.25)", "8.5 x 11,(1.29)",
        "3 x 4,(1.33)", "5 x 7,(1.40)", "2 x 3,(1.50)", "10 x 16,(1.60)",
        "3 x 5,(1.67)", "9 x 16,(1.78)", "1 x 2,(2.00)"];
    var $arMenu = $("#aspectRatioMenu");
    aspectRatios.forEach(function (ratio) {
        var parts = ratio.split(",");
        var row = '<div class="arRow">' +
            '<div class="hxvRatio">' + parts[0] + '</div>' +
            '<div class="calcRatio">' + parts[1] + '</div>' +
            '</div>';
        var $item = $('<li><a href="#">' + row + '</a></li>');
        $arMenu.append($item);
    });
    $('#ddAspectRatio').dropdown();
    $('#ddAspectRatio').parent().find("a").click(function (e) {
        $('#ddAspectRatio .title').text($(e.currentTarget).find(".hxvRatio").text());
    });

    $("#imageOrientation button").click(function (e) {
        var $btn = $(e.currentTarget);
        if (!$btn.hasClass("active")) {
            $("#imageOrientation button").removeClass("active");
            $btn.addClass("active");
        }
        $btn.blur();
    });

    let $overlapValue = $(".overlapVal");
    $("#overlapSlider").on("input", (evt) => {
        $overlapValue.text(evt.target.value);
    });

    $("#cameraOrientation button").click(function (e) {
        var $btn = $(e.currentTarget);
        if (!$btn.hasClass("active")) {
            $("#cameraOrientation button").removeClass("active");
            $btn.addClass("active");
        }
        $btn.blur();
    });

    $("#btnCalc").click(function () { calcLayout(); });

    var lensView = {
        "14mm": { landscape: 104.3, portrait: 81.2 },
        "15mm": { landscape: 100.4, portrait: 77.3 },
        "16mm": { landscape: 96.7, portrait: 73.7 },
        "17mm": { landscape: 93.3, portrait: 70.4 },
        "20mm": { landscape: 84.0, portrait: 61.9 },
        "24mm": { landscape: 73.7, portrait: 53.1 },
        "28mm": { landscape: 65.5, portrait: 46.4 },
        "35mm": { landscape: 54.4, portrait: 37.8 },
        "50mm": { landscape: 39.6, portrait: 27.0 },
        "70mm": { landscape: 28.8, portrait: 19.5 },
        "85mm": { landscape: 23.9, portrait: 16.1 },
        "100mm": { landscape: 20.4, portrait: 13.7 },
        "135mm": { landscape: 15.2, portrait: 10.2 },
        "200mm": { landscape: 10.3, portrait: 6.9 }
    };
    let cameraSensors = {
        "r5": { landscape: 8192, portrait: 4320 },
        "5D Mark iv": { landscape: 5760, portrait: 3840 },
        "GX9": { landscape: 5184, portrait: 3888 }
    };
    let sensorRes = cameraSensors["r5"];

    let $menu = $("#lensMenu");
    let $tableBody = $("#angleOfViewTable").find("tbody");
    $menu.empty();
    Object.keys(lensView).forEach(lens => {
        $menu.append($('<li><a href="#">' + lens + '</a></li>'));

        let viewObj = lensView[lens];
        let aovRow = $('<tr><th scope="row"><span class="angleOfViewLens">' + lens + '</span></th><td>' +
            viewObj.landscape + '</td><td>' + viewObj.portrait + '</td></tr>');
        $tableBody.append(aovRow);
    });
    $("#angleOfViewTable").find("th").css("padding", ".5rem");
    $("#angleOfViewTable").find("td").css("padding", ".5rem");
    $tableBody.find("tr").css("text-align", "center");
    $(".angleOfViewLens").click((e) => {
        let orientation = $("#imageOrientation").find(".active").text();
        let angleOfViewVal;
        if (orientation == "Horizontal") {
            angleOfViewVal = $(e.currentTarget).parent().next().text();
        } else {
            angleOfViewVal = $(e.currentTarget).parent().next().next().text();
        }
        $("#inputView").val(angleOfViewVal);
        $('#angleOfViewModal').modal('hide');
    });

    $('#ddFocalLength').dropdown();
    $('#ddFocalLength').parent().find("a").click(function (e) {
        $('#ddFocalLength .title').text(e.currentTarget.text);
    });

    function calcLayout() {
        var finalHView = Number($('#inputView').val()),
            aspectRatio = calcAspectRatio(),
            finalVView = finalHView / aspectRatio,
            lens = $('#ddFocalLength .title').text(),
            overlap = Number($overlapValue.text()),
            portrait = $("#cameraOrientation button").first().hasClass("active"),
            hOrientation = portrait ? "portrait" : "landscape",
            vOrientation = portrait ? "landscape" : "portrait",
            hCoverage = lensView[lens][hOrientation], hView = hCoverage,
            vCoverage = lensView[lens][vOrientation], vView = vCoverage,
            hPan = Math.round(hCoverage * (1 - overlap / 100)),
            vPan = Math.round(vCoverage * (1 - overlap / 100)),
            hOverlap = 100 - (100 * hPan / hCoverage),
            vOverlap = 100 - (100 * vPan / vCoverage),
            hCount = 1, vCount = 1,
            hPixels = sensorRes[hOrientation], vPixels = sensorRes[vOrientation];

        while (hView < finalHView) {
            hView += hPan;
            hCount++;
            hPixels += parseInt(sensorRes[hOrientation] * (1 - hOverlap / 100));
        }
        while (vView < finalVView) {
            vView += vPan;
            vCount++;
            vPixels += parseInt(sensorRes[vOrientation] * (1 - vOverlap / 100));
        }

        var $shotLayout = $(".shotLayout .panel-body");
        $shotLayout.empty();
        // TODO: limit the max row/col
        for (var row = 0; row < vCount; row++) {
            var $row = $('<div class="layoutRow"></div>'),
                shotWidth = (portrait ? 24 : 36), shotHeight = (portrait ? 36 : 24);
            $row.css("height", "" + (shotHeight - 1) + "px");
            if (row > 0)
                $row.css("margin-top", "-" + (shotHeight * vOverlap / 100) + "px");
            $row.css("z-index", vCount - row);
            for (var col = 0; col < hCount; col++) {
                var $shot = $('<div class="' + (portrait ? "portraitShot" : "landscapeShot") + '"></div>');
                $shot.css("left", "" + (col * shotWidth * (1 - hOverlap / 100)) + "px");
                $shot.css("z-index", hCount - col);
                $row.append($shot);
            }
            $shotLayout.append($row);
        }

        var $shotData = $(".shotLayout ul"), rowStr;
        $shotData.empty();
        $shotData.append($('<li class="list-group-item">layout: ' + hCount + " x " + vCount + '</li>'));
        if (hCount > 1) {
            rowStr = '<div class="panRow">' +
                '<div class="panVal">horizontal pan: ' + hPan + '&deg;</div>' +
                '<div class="panOverlap">actual overlap: ' + hOverlap.toFixed(1) + '%</div>' +
                '</div>';
            $shotData.append($('<li class="list-group-item">' + rowStr + '</li>'));
        }
        if (vCount > 1) {
            rowStr = '<div class="panRow">' +
                '<div class="panVal">vertical pan: ' + vPan + '&deg;</div>' +
                '<div class="panOverlap">actual overlap: ' + vOverlap.toFixed(1) + '%</div>' +
                '</div>';
            $shotData.append($('<li class="list-group-item">' + rowStr + '</li>'));
        }
        $shotData.append($('<li class="list-group-item">final image dimensions: ' + hPixels + " x " + vPixels + '</li>'));

        var $hShots = $shotLayout.find(".layoutRow").first().find(portrait ? ".portraitShot" : ".landscapeShot"),
            shotsWidth = $hShots.last()[0].getBoundingClientRect().right - $hShots.first()[0].getBoundingClientRect().left,
            $vShots = $shotLayout.find(".layoutRow"),
            shotsHeight = $vShots.last()[0].getBoundingClientRect().bottom - $vShots.first()[0].getBoundingClientRect().top,
            sampleWidth, sampleHeight, sampleLeft = 0, sampleTop = 0, arHpixels = hPixels, arVpixels = vPixels,
            hOffset = ($shotLayout.outerWidth() - $shotLayout.width()) / 2,
            vOffset = ($shotLayout.outerHeight() - $shotLayout.height()) / 2;
        if (hPixels / vPixels < aspectRatio) {
            arVpixels = Math.round(hPixels / aspectRatio);
            sampleWidth = shotsWidth;
            sampleHeight = shotsHeight / (vPixels / arVpixels);
            sampleTop = (shotsHeight - sampleHeight) / 2;
        } else {
            arHpixels = Math.round(vPixels * aspectRatio);
            sampleHeight = shotsHeight;
            sampleWidth = shotsWidth / (hPixels / arHpixels);
            sampleLeft = (shotsWidth - sampleWidth) / 2;
        }
        var $sampleImage = $('<div class="sampleImage"></div>');
        $sampleImage.css("width", "" + sampleWidth + "px");
        $sampleImage.css("height", "" + sampleHeight + "px");
        $sampleImage.css("left", sampleLeft + hOffset);
        $sampleImage.css("top", sampleTop + vOffset);
        $shotLayout.append($sampleImage);
        $shotData.append($('<li class="list-group-item">aspect ratio dimensions: ' + arHpixels + " x " + arVpixels + '</li>'));

    }

    // returns a floating point number indicating the ratio of the width to the height.
    // A value greater than 1 indicates an image that is wider than it is tall (horizontal);
    // a value less than 1 is a vertically-oriented image.
    function calcAspectRatio() {
        var ratioMenu = $('#ddAspectRatio .title').text(),
            parts = ratioMenu.split(/\s*x\s*/),
            horitzontal = $("#imageOrientation button").first().hasClass("active");
        if (horitzontal)
            return Number(parts[1]) / Number(parts[0]);
        else
            return Number(parts[0]) / Number(parts[1]);
    }
});
