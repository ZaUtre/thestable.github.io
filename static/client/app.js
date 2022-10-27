initAnimations();
initBookingForm();
navEvents();

const googleApiKey = 'AIzaSyDEyI-WDW_xvepethIYS3XA11r73NgaVRc';

function initBookingForm() {
    // init datepicker events
    $(function () {

        $('input[name="datefilter"]').daterangepicker({
            autoUpdateInput: false,
            locale: {
                cancelLabel: 'Clear'
            }
        });

        $('input[name="datefilter"]').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));

            initSecondBookingStep(picker.startDate, picker.endDate)
            hideThirdBookingStep();
        });

        $('input[name="datefilter"]').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            hideSecondBookingStep();
            hideThirdBookingStep();
        });

    });
}

let vans = {
    rocinante: 'c_o5i24ulbm1psuek3guprv42q8g@group.calendar.google.com',
    alfonso: 'c_7cf7cf9df16b5d8032e4e88060fce5b2da8c8bdf0821c66a5f61c74e2a62ae93@group.calendar.google.com',
    bucephalus: 'c_71f7b3fba73e19c3ff433a5d987e59075679e0fc66ce26c5d7c1cf385baad74c@group.calendar.google.com'
}

/**
 * Gets calender events between dates for given calender/van
 */
function getCalenderEvents(calendarID, startDate, endDate) {
    let parameters = "timeMin=" + encodeURIComponent(startDate.format()) + "&timeMax=" + encodeURIComponent(endDate.format())

    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://www.googleapis.com/calendar/v3/calendars/" + calendarID + "/events?" + parameters + "&key=" + googleApiKey,
            success: function (data) {
                resolve(data)
            },
            error: (data) => {
                reject(data)
            }
        });
    })
}

function showAvailableVans(startDate, endDate) {
    Object.keys(vans).forEach((van) => {
        getCalenderEvents(vans[van], startDate, endDate)
            .then((data) => {
                if (data.items.length === 0) {
                    $('.van[data-name="' + data.summary.toLowerCase() + '"]').css('display', 'block')
                }
                console.log(data)
            })
            .catch((data) => {
                console.log(data)
            });
    })
}

async function initSecondBookingStep(startDate, endDate) {
    $('html, body').animate({
        scrollTop: $("#booking-step-2").offset().top - 150
    }, 200);

    if (!$('.booking-step-2').hasClass('active')) {
        $('.booking-step-2').addClass('active');
    }

    showAvailableVans(startDate, endDate);

    $('.van').on('click', (e) => {
        let $target = $(e.target);
        let vanName = $target.data('name');

        if (!vanName) {
            vanName = $target.parents('.van').data('name');
        }

        let dateRange = $('#booking-step-1 .datepicker').val();

        initThirdBookingStep(vanName, dateRange, startDate, endDate)
    })
}

function hideSecondBookingStep() {
    $('.booking-step-2').removeClass('active');
}

function initThirdBookingStep(vanName, dateRange, startDate, endDate) {
    $('#van-input').val(vanName);
    $('#date-input').val(dateRange);

    $('html, body').animate({
        scrollTop: $("#booking-step-3").offset().top - 150
    }, 200);

    if (!$('.booking-step-3').hasClass('active')) {
        $('.booking-step-3').addClass('active');

        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay));

        $('.calc-price').text((diffDays * 140 + 100))
    }

    $('#email-radio, #phone-radio').on('change', (e) => {
        if ($(e.target).attr('id').indexOf('email') != -1) {
            $('#email').addClass('active')
            $('#phone').removeClass('active')
        } else {
            $('#email').removeClass('active')
            $('#phone').addClass('active')
        }
    })

    $('#booking-step-3 .booking-form').on('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        $('.booking-container').removeClass('active');
        $('.booking-confirmation').addClass('active');

        let request = {
            email: $('#email').val(),
            phone: $('#phone').val(),
            van: vanName,
            dateRange: dateRange
        }

        $.ajax({
            url: 'https://eoup9yw6a36n9ny.m.pipedream.net',
            method: 'POST',
            data: request,
            success: (data) => {
                console.log('success')
            },
            error: (data) => {
                console.log('error')
            }
        })
    })
}

function hideThirdBookingStep() {
    $('.booking-step-3').removeClass('active');
}

function navEvents() {
    $('.nav-btn').on('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        $('.nav-links-wrapper').addClass('active');
        $('html').css({ 'overflow': 'hidden' });
    })

    $('.nav-back-btn').on('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        $('.nav-links-wrapper').removeClass('active');
        $('html').css({ 'overflow': 'initial' });
    })

    $('.nav-anchor, .book-now-btn').on('click', (e) => {
        $('.nav-links-wrapper').removeClass('active');
        $('html').css({ 'overflow': 'initial' });
    })
}