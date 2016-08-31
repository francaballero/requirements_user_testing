/*global angular: true, $: true, reading: true, writing: true, terms: true, history: true, window: true */


var app = angular.module('application', []);

var api_key = "f0ffde9fa2203be98f7370bd30551e1b";

app.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});

// Directive to validate inputs
app.directive('wjValidationError', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctl) {
            scope.$watch(attrs.wjValidationError, function (errorMsg) {
                elm[0].setCustomValidity(errorMsg);
                ctl.$setValidity('wjValidationError', errorMsg ? false : true);
            });
        }
    };
});

app.controller('appController', ['$scope', '$window',
            function ($scope, $window) {

        /* User testing SECTION */



        //
        // DATA Section
        //

        // Page nagivation variables
        $scope.introduction = true;
        $scope.demographics = false;
        $scope.explanation = false;
        $scope.before_starting = false;
        $scope.reading_introduction = false;
        $scope.start_reading = false;
        $scope.feedback_reading = false;
        $scope.writing_introduction = false;
        $scope.start_writing = false;
        $scope.feedback_writing = false;
        $scope.finish_page = false;

        $scope.currentPage = 0;
        $scope.currentGlobalPage = 0;
        $scope.pageSize = 1;

        // "Show" variables
        $scope.show_introduction = false;
        $scope.showID = false;


        // Load variables from models
        $scope.reading = reading;
        $scope.writing = writing;
        $scope.terms = terms;

        // User data
        $scope.personal_data = {
            "profession": "",
            "profession_other": "",
            "experience": "",
            "experience_templates": "",
            "experience_master": "",
            "experience_ears": ""
        };
        $scope.userID = '';
        $scope.results_reading = {};
        $scope.results_writing = {};
        $scope.writing_solution = '';
        $scope.profession = '';
        $scope.help = {
            "helpMaster": false,
            "helpEars": false
        };
        $scope.requirements = [];
        $scope.startDate = new Date().getTime();


        // Set the interval for shuffle the test
        var startShuffle_reading = 1;
        var endShuffle_reading = $scope.reading.length;
        //var startShuffle_writing = 1;
        //var endShuffle_writing = $scope.writing.length - 2;
        // End intervals


        //
        // Global functions Section
        //


        // Save the results into the OpenWS database
        var saveJson = function () {
            //console.log($scope.results_reading);
            //console.log($scope.results_writing);
            var results = angular.extend({}, $scope.personal_data, $scope.help, $scope.results_reading, $scope.results_writing);
            //console.log(results);
            //console.log(JSON.stringify(results));

            // Saving in a collection called "results"
            $.post("https://openws.herokuapp.com/evaluation?apiKey=" + api_key, results)
                .done(function (data) {
                    $scope.userID = data._id;
                    //console.log(data);
                    //console.log("Product saved successfully");
                    //console.log(data._id);
                });
        };

        // Realizes a random shaffle of an array
        var randomShuffle = function (array, begin, end) {
            var array_begin = array.slice(0, begin);
            var array_partial = array.slice(begin, end);
            var array_end = array.slice(end, array.length);

            var m = array_partial.length,
                t, i;

            while (m) {
                i = Math.floor(Math.random() * m--);
                t = array_partial[m];
                array_partial[m] = array_partial[i];
                array_partial[i] = t;
            }

            return array_begin.concat(array_partial, array_end);
        };

        // Shuffle the content of the test
        $scope.reading = randomShuffle($scope.reading, startShuffle_reading, endShuffle_reading);
        //$scope.writing = randomShuffle($scope.writing, startShuffle_writing, endShuffle_writing);
        //console.log("Shuffle reading: " + JSON.stringify($scope.reading));
        //console.log("Shuffle writing: " + JSON.stringify($scope.writing));


        /*$scope.previousPage = function () {
            $scope.currentPage = $scope.currentPage - 1;
        };*/


        //
        // Navigation functions Section
        //


        // Next page of the reading test
        $scope.nextReadingPage = function (item) {
            $scope.currentPage = $scope.currentPage + 1;
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;
            saveReadingPage(item);
            $scope.startDate = new Date().getTime();
        };

        // Add the results of the reading test to an array
        var saveReadingPage = function (item) {
            var time = ((new Date().getTime()) - $scope.startDate) / 1000;
            $scope.results_reading["req" + item.id] = item.req;
            $scope.results_reading["question" + item.id] = item.question;
            $scope.results_reading["answer" + item.id] = item.answer;
            $scope.results_reading["time_r" + item.id] = time;
            //console.log(JSON.stringify($scope.results_reading));
        };

        // Finish the reading test
        $scope.finishReadingPage = function (item) {
            saveReadingPage(item);
            $scope.start_reading = false;
            $scope.feedback_reading = true;
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;
            $scope.currentPage = 0;
        };

        // Start the demographics page
        $scope.startDemographics = function () {
            $scope.introduction = false;
            $scope.demographics = true;
        };

        // Start the explanation page
        $scope.startExplanation = function (profession) {
            $scope.demographics = false;
            if ($scope.personal_data.experience_master === 'Yes' && $scope.personal_data.experience_ears === 'Yes') {
                $scope.before_starting = true;
            } else {
                $scope.explanation = true;
            }
        };

        // Shows the extended explanation
        $scope.showIntroduction = function () {
            $scope.show_introduction = true;
        };

        // Manage the inputs of the demographics page
        $scope.experienceRE = function () {
            // If the user has no experience in RE, then he has no experience in template-systems
            if ($scope.personal_data.experience === 'No') {
                $scope.personal_data.experience_templates = 'No';
                $scope.personal_data.experience_master = 'No';
                $scope.personal_data.experience_ears = 'No';
            } else {
                $scope.personal_data.experience_templates = '';
                $scope.personal_data.experience_master = '';
                $scope.personal_data.experience_ears = '';
            }
        };

        // Manage the inputs of the demographics page
        $scope.experienceTemplates = function () {
            // If the user has no experience in template-systems, then he has no experience in MASTER and EARS
            if ($scope.personal_data.experience_templates === 'No') {
                $scope.personal_data.experience_master = 'No';
                $scope.personal_data.experience_ears = 'No';
            } else {
                $scope.personal_data.experience_master = '';
                $scope.personal_data.experience_ears = '';
            }
        };

        // Go to before starting page
        $scope.continueExplanation = function () {
            $scope.explanation = false;
            $scope.before_starting = true;
        };

        // Returns the number of pages
        $scope.numberOfPages = function (array) {
            var length = $scope.reading.length + $scope.writing.length;
            return Math.ceil(length / $scope.pageSize);
        };

        // Start the reading introduction
        $scope.startReadingIntroduction = function () {
            $scope.before_starting = false;
            $scope.reading_introduction = true;
            //console.log($scope.personal_data.profession + $scope.personal_data.experience + $scope.personal_data.experience_templates + $scope.personal_data.experience_master + $scope.personal_data.experience_ears);
        };

        // Start the reading test
        $scope.startReading = function () {
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;
            $scope.reading_introduction = false;
            $scope.start_reading = true;
            $scope.startDate = new Date().getTime();
        };

        // Save the reading test
        $scope.saveReading = function () {
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;
            $scope.results_reading.feedback_r1 = $scope.feedback_r1;
            $scope.results_reading.feedback_r2 = $scope.feedback_r2;
            $scope.results_reading.feedback_r3 = $scope.feedback_r3;
            $scope.results_reading.feedback_r4 = $scope.feedback_r4;
            $scope.results_reading.feedback_r5 = $scope.feedback_r5;
            //console.log($scope.results_reading);
            $scope.feedback_reading = false;
            $scope.writing_introduction = true;
            $scope.startDate = new Date().getTime();
        };

        // Start the writing test
        $scope.startWriting = function () {
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;
            $scope.writing_introduction = false;
            $scope.start_writing = true;
        };

        // Save the writing page and go to next one
        $scope.nextWritingPage = function (item, i) {
            $scope.currentPage = $scope.currentPage + 1;
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;

            saveWritingPage(item);
            $scope.functionalrequirements = [];
            $scope.propertyrequirements = [];
            $scope.environmentrequirements = [];
            $scope.processrequirements = [];
            $scope.conditions = [];

            $scope.ubiquitousrequirements = [];
            $scope.eventrequirements = [];
            $scope.unwantedrequirements = [];
            $scope.staterequirements = [];
            $scope.optionalrequirements = [];
            $scope.complexrequirements = [];

            $scope.requirements = [];

            if (item.id === 2) {
                $scope.master = false;
                $scope.ears = true;
                $scope.natural = false;
                $scope.glossary = false;
            } else {
                $scope.master = true;
                $scope.ears = false;
                $scope.natural = false;
                $scope.glossary = false;
            }

            $scope.defined_master = false;
            $scope.defined_ears = false;
            $scope.defined_terms = true;
            $scope.startDate = new Date().getTime();
            $scope.writing_solution = '';
            //console.log($scope.results_writing);
        };

        // Finish the writing pages
        $scope.finishWritingPage = function (item) {
            $scope.start_writing = false;
            $scope.feedback_writing = true;
            saveWritingPage(item);
            $scope.currentGlobalPage = $scope.currentGlobalPage + 1;
        };

        // Save writing page
        var saveWritingPage = function (item) {
            var i;

            //Descriptions
            for (i = 0; i < $scope.terms.length; i++) {
                $scope.results_writing["description" + item.id] = item.description;
            }
            //Terms
            for (i = 0; i < $scope.terms.length; i++) {
                $scope.results_writing["term" + item.id + "_" + (i + 1)] = $scope.terms[i].name;
                if ($scope.terms[i].definition) {
                    $scope.results_writing["term" + item.id + "_" + (i + 1) + "_def"] = $scope.terms[i].definition;
                }
            }

            //Functional Req
            for (i = 0; i < $scope.functionalrequirements.length; i++) {
                $scope.results_writing["fun_rq_" + item.id + "_" + (i + 1)] = $scope.functionalrequirements[i][0].to_string;
            }
            //Property Req
            for (i = 0; i < $scope.propertyrequirements.length; i++) {
                $scope.results_writing["prt_rq_" + item.id + "_" + (i + 1)] = $scope.propertyrequirements[i][0].to_string;
            }
            //Environment Req
            for (i = 0; i < $scope.environmentrequirements.length; i++) {
                $scope.results_writing["en_rq_" + item.id + "_" + (i + 1)] = $scope.environmentrequirements[i][0].to_string;
            }
            //Process Req
            for (i = 0; i < $scope.processrequirements.length; i++) {
                $scope.results_writing["pro_rq_" + item.id + "_" + (i + 1)] = $scope.processrequirements[i][0].to_string;
            }
            //Ubiquitious Req
            for (i = 0; i < $scope.ubiquitousrequirements.length; i++) {
                $scope.results_writing["ub_rq_" + item.id + "_" + (i + 1)] = $scope.ubiquitousrequirements[i][0].to_string;
            }
            //Event-Driven Req
            for (i = 0; i < $scope.eventrequirements.length; i++) {
                $scope.results_writing["evd_rq_" + item.id + "_" + (i + 1)] = $scope.eventrequirements[i][0].to_string;
            }
            //Unwanted behaviours Req
            for (i = 0; i < $scope.unwantedrequirements.length; i++) {
                $scope.results_writing["uwb_rq_" + item.id + "_" + (i + 1)] = $scope.unwantedrequirements[i][0].to_string;
            }
            //State-Driven Req
            for (i = 0; i < $scope.staterequirements.length; i++) {
                $scope.results_writing["std_rq_" + item.id + "_" + (i + 1)] = $scope.staterequirements[i][0].to_string;
            }
            //Optional Req
            for (i = 0; i < $scope.optionalrequirements.length; i++) {
                $scope.results_writing["opf_rq_" + item.id + "_" + (i + 1)] = $scope.optionalrequirements[i][0].to_string;
            }
            //Complex Req
            for (i = 0; i < $scope.complexrequirements.length; i++) {
                $scope.results_writing["cx_rq_" + item.id + "_" + (i + 1)] = $scope.complexrequirements[i][0].to_string;
            }
            $scope.results_writing["time_w" + item.id] = ((new Date().getTime()) - $scope.startDate) / 1000;

            //Natural Req
            for (i = 0; i < $scope.requirements.length; i++) {
                $scope.results_writing["natural_rq_" + item.id + "_" + (i + 1)] = $scope.requirements[i].name;
            }

            //N/A
            if ($scope.writing_solution === 'N/A') {
                $scope.results_writing["non_answer_" + item.id] = "true";
            }
        };

        $scope.nonAnswer = function (writing_solution) {
            if (writing_solution === 'N/A') {
                $scope.writing_solution = 'N/A';
            } else {
                $scope.writing_solution = '';
            }
        };

        // Check that the user specify any requirement or N/A
        $scope.somethingWritten = function (writing_solution) {
            var sum = $scope.functionalrequirements.length + $scope.propertyrequirements.length + $scope.environmentrequirements.length + $scope.processrequirements.length + $scope.ubiquitousrequirements.length + $scope.eventrequirements.length + $scope.unwantedrequirements.length + $scope.staterequirements.length + $scope.optionalrequirements.length + $scope.complexrequirements.length + $scope.requirements.length;
            return writing_solution != 'N/A' && sum === 0;

        };

        // Finish and save the writing test
        $scope.saveWriting = function () {
            $scope.results_writing.feedback_w1 = $scope.feedback_w1;
            $scope.results_writing.feedback_w2 = $scope.feedback_w2;
            $scope.results_writing.feedback_w3 = $scope.feedback_w3;
            $scope.results_writing.feedback_w4 = $scope.feedback_w4;
            $scope.results_writing.feedback_w5 = $scope.feedback_w5;
            saveJson();
            $scope.feedback_writing = false;
            $scope.finish_page = true;
        };

        // The user has checked the MASTER help
        $scope.helpMaster = function () {
            $scope.help.helpMaster = true;
        };

        // The user has checked the EARS help
        $scope.helpEars = function () {
            $scope.help.helpEars = true;
        };

        // Display the User ID of the database
        $scope.calculateID = function () {
            $scope.showID = true;
        };

        // New natural requirement
        $scope.newReq = function () {
            $scope.requirements.push({
                name: ''
            });
        };

        // Remove natural requirement
        $scope.removeReq = function (i) {
            $scope.requirements.splice(i, 1);
        };

        // Block back button on the browser
        history.pushState(null, null, null);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, null);
        });




        /* Requirements generator SECTION */



        //
        // DATA Section
        //


        $scope.master = true;
        $scope.ears = false;
        $scope.natural = false;
        $scope.glossary = false;
        $scope.natural = false;
        $scope.master_state = false;
        $scope.ears_state = false;
        $scope.natural_state = false;
        $scope.term_saved = true;


        // Requirements variables
        $scope.functionalrequirements = [];
        $scope.propertyrequirements = [];
        $scope.environmentrequirements = [];
        $scope.processrequirements = [];
        $scope.conditions = [];

        $scope.ubiquitousrequirements = [];
        $scope.eventrequirements = [];
        $scope.unwantedrequirements = [];
        $scope.staterequirements = [];
        $scope.optionalrequirements = [];
        $scope.complexrequirements = [];

        $scope.defined_master = false;
        $scope.defined_ears = false;
        $scope.defined_terms = true;

        //var delay = 2500; //Delay after green hover



        //
        // Global functions Section
        //

        //Navegation functions
        $scope.goMaster = function () {
            $scope.ears = $scope.glossary = $scope.natural = false;
            $scope.master = true;
        };
        $scope.goEars = function () {
            $scope.master = $scope.glossary = $scope.natural = false;
            $scope.ears = true;
        };
        $scope.goNaturalLanguage = function () {
            $scope.master = $scope.glossary = $scope.ears = false;
            $scope.natural = true;
        };
        $scope.goGlossary = function () {
            $scope.master_state = $scope.master;
            $scope.ears_state = $scope.ears;
            $scope.natural_state = $scope.natural;
            $scope.master = $scope.ears = $scope.natural = false;
            $scope.glossary = true;
        };
        $scope.goBackFromGlossary = function () {
            $scope.master = $scope.master_state;
            $scope.ears = $scope.ears_state;
            $scope.natural = $scope.natural_state;
            $scope.glossary = false;
        };


        var titleCase = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };

        var titleLowerCase = function (string) {
            return string.charAt(0).toLowerCase() + string.slice(1);
        };


        //Inform the user where to click
        $scope.newTermOver = function () {
            /*var myElements = document.getElementsByClassName("new-term");

            for (var i = 0; i < myElements.length; i++) {
                myElements[i].style.background = 'rgba(0, 255, 68, .4)';
            } */
        };

        $scope.newTermLeave = function () {
            /*var myElements = document.getElementsByClassName("new-term");

            setTimeout(function () {
                for (var i = 0; i < myElements.length; i++) {
                    myElements[i].style.background = '';
                }
            }, delay);*/

        };

        $scope.newConditionOver = function () {
            /*var myElements = document.getElementsByClassName("condition");

            for (var i = 0; i < myElements.length; i++) {
                myElements[i].style.background = 'rgba(0, 255, 68, .4)';
            }*/
        };

        $scope.newConditionLeave = function () {
            /*var myElements = document.getElementsByClassName("condition");

            setTimeout(function () {
                for (var i = 0; i < myElements.length; i++) {
                    myElements[i].style.background = '';
                }
            }, delay);*/
        };


        // Terms
        $scope.newTerm = function () {
            $scope.terms.push({
                name: '',
                definition: ''
            });
            $scope.term_saved = false;
        };

        $scope.addtoTerms = function () {
            if (!$scope.defined_terms) $scope.defined_terms = true;
            $('.success').show().delay(2500).fadeOut();
            $scope.term_saved = true;
        };


        $scope.removeTerm = function (i) {
            $scope.terms.splice(i, 1);
            if ($scope.terms.length === 0) {
                $scope.defined_terms = false;
            }
        };
        // END terms



        //
        // MASTER functions Section
        //


        // Liabilities
        $scope.liabilities = [
            {
                name: 'shall',
            },
            {
                name: 'should',
            },
            {
                name: 'will',
            }
        ];

        $scope.addLiability = function (i) {
            $scope.functionalmaster[i].name = $scope.selected.name;
        };
        // END liabilities



        // FunctionalMASTER
        $scope.functional_terms = [
            {
                name: '-',
            },
            {
                name: 'provide <actor> with the ability to',
            },
            {
                name: 'be able to',
            }
        ];

        $scope.newFunctionalReq = function () {
            $scope.functionalrequirements.push([{
                    to_string: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'provide'
            }, {
                    name: ''
            }, {
                    name: 'with the ability to'
            }, {
                    name: ''
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.removeFunctionalReq = function (i) {
            $scope.functionalrequirements.splice(i, 1);

            if ($scope.functionalrequirements.length === 0 && $scope.propertyrequirements.length === 0 && $scope.environmentrequirements.length === 0 && $scope.processrequirements.length === 0 && $scope.conditions.length === 0) {
                $scope.defined_master = false;
            }
        };

        $scope.addtoFunctionalReq = function (i, j, selected) {
            if (selected) {
                if (selected[1] && selected[1].to_string) { // We push condition
                    $scope.functionalrequirements[i][j].name = selected[1].to_string;
                } else {
                    if (!selected.name)
                        $scope.functionalrequirements[i][j].name = selected;
                    else
                        $scope.functionalrequirements[i][j].name = selected.name;
                }

                //To-string
                if ($scope.functionalrequirements[i][1].name) {
                    $scope.functionalrequirements[i][0].to_string = $scope.functionalrequirements[i][1].name + ', ';
                } else {
                    $scope.functionalrequirements[i][0].to_string = '';
                }
                $scope.functionalrequirements[i][0].to_string += $scope.functionalrequirements[i][2].name + ' ' + $scope.functionalrequirements[i][3].name + ' ';

                switch ($scope.functionalrequirements[i][4].name) {
                case 'provide <actor> with the ability to':
                    $scope.functionalrequirements[i][0].to_string += $scope.functionalrequirements[i][5].name + ' ' + $scope.functionalrequirements[i][6].name + ' ' + $scope.functionalrequirements[i][7].name + ' ';
                    break;
                case 'be able to':
                    $scope.functionalrequirements[i][0].to_string += $scope.functionalrequirements[i][4].name + ' ';
                }

                $scope.functionalrequirements[i][0].to_string += $scope.functionalrequirements[i][8].name + ' ' + $scope.functionalrequirements[i][9].name;

                $scope.functionalrequirements[i][0].to_string = $scope.functionalrequirements[i][0].to_string.trim();
                $scope.functionalrequirements[i][0].to_string = titleCase($scope.functionalrequirements[i][0].to_string + '.');
            }
        };
        // END FunctionalMASTER


        // PropertyMASTER
        $scope.newPropertyReq = function () {
            $scope.propertyrequirements.push([{
                to_string: ''
            }, {
                name: ''
            }, {
                name: ''
            }, {
                name: ''
            }, {
                name: ''
            }, {
                name: 'be'
            }, {
                name: ''
            }, {
                name: ''
            }]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.removePropertyReq = function (i) {
            $scope.propertyrequirements.splice(i, 1);

            if ($scope.functionalrequirements.length === 0 && $scope.propertyrequirements.length === 0 && $scope.environmentrequirements.length === 0 && $scope.processrequirements.length === 0 && $scope.conditions.length === 0) {
                $scope.defined_master = false;
            }
        };

        $scope.addtoPropertyReq = function (i, j, selected) {
            if (selected) {
                if (selected[1] && selected[1].to_string) {
                    $scope.propertyrequirements[i][j].name = selected[1].to_string;
                } else {
                    if (!selected.name)
                        $scope.propertyrequirements[i][j].name = selected;
                    else
                        $scope.propertyrequirements[i][j].name = selected.name;
                }
                if ($scope.propertyrequirements[i][1].name) {
                    $scope.propertyrequirements[i][0].to_string = $scope.propertyrequirements[i][1].name + ', ';
                } else {
                    $scope.propertyrequirements[i][0].to_string = '';
                }

                $scope.propertyrequirements[i][0].to_string += $scope.propertyrequirements[i][2].name + ' ' + $scope.propertyrequirements[i][3].name + ' ' + $scope.propertyrequirements[i][4].name + ' ' + $scope.propertyrequirements[i][5].name + ' ';

                if ($scope.propertyrequirements[i][6].name) {
                    $scope.propertyrequirements[i][0].to_string += $scope.propertyrequirements[i][6].name + ' ';
                }

                $scope.propertyrequirements[i][0].to_string += $scope.propertyrequirements[i][7].name;

                $scope.propertyrequirements[i][0].to_string = $scope.propertyrequirements[i][0].to_string.trim();
                $scope.propertyrequirements[i][0].to_string = titleCase($scope.propertyrequirements[i][0].to_string + '.');
            }
        };
        // END PropertyMASTER



        // EnvironmentMASTER
        $scope.newEnvironmentReq = function () {
            $scope.environmentrequirements.push([{
                    to_string: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'be designed in a way'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'can be operated'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.removeEnvironmentReq = function (i) {
            $scope.environmentrequirements.splice(i, 1);

            if ($scope.functionalrequirements.length === 0 && $scope.propertyrequirements.length === 0 && $scope.environmentrequirements.length === 0 && $scope.processrequirements.length === 0 && $scope.conditions.length === 0) {
                $scope.defined_master = false;
            }
        };

        $scope.addtoEnvironmentReq = function (i, j, selected) {
            if (selected) {
                if (selected[1] && selected[1].to_string) {
                    $scope.environmentrequirements[i][j].name = selected[1].to_string;
                } else {
                    if (!selected.name)
                        $scope.environmentrequirements[i][j].name = selected;
                    else
                        $scope.environmentrequirements[i][j].name = selected.name;
                }

                if ($scope.environmentrequirements[i][1].name) {
                    $scope.environmentrequirements[i][0].to_string = $scope.environmentrequirements[i][1].name + ' ';
                } else {
                    $scope.environmentrequirements[i][0].to_string = '';
                }

                $scope.environmentrequirements[i][0].to_string += $scope.environmentrequirements[i][2].name + ' ' + $scope.environmentrequirements[i][3].name + ' ' + $scope.environmentrequirements[i][4].name;

                if ($scope.environmentrequirements[i][5].name) {
                    $scope.environmentrequirements[i][0].to_string += ', ' + titleLowerCase($scope.environmentrequirements[i][5].name) + ',';
                }

                $scope.environmentrequirements[i][0].to_string += ' ' + $scope.environmentrequirements[i][6].name + ' ' + $scope.environmentrequirements[i][7].name + ' ' + $scope.environmentrequirements[i][8].name + ' ';

                if ($scope.environmentrequirements[i][9].name) {
                    $scope.environmentrequirements[i][0].to_string += $scope.environmentrequirements[i][9].name + ' ';
                }

                $scope.environmentrequirements[i][0].to_string += $scope.environmentrequirements[i][10].name;

                $scope.environmentrequirements[i][0].to_string = $scope.environmentrequirements[i][0].to_string.trim();
                $scope.environmentrequirements[i][0].to_string = titleCase($scope.environmentrequirements[i][0].to_string + '.');

            }
        };
        // END EnvironmentMASTER


        // ProcessMASTER
        $scope.newProcessReq = function () {
            $scope.processrequirements.push([{
                    to_string: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.removeProcessReq = function (i) {
            $scope.processrequirements.splice(i, 1);

            if ($scope.functionalrequirements.length === 0 && $scope.propertyrequirements.length === 0 && $scope.environmentrequirements.length === 0 && $scope.processrequirements.length === 0 && $scope.conditions.length === 0) {
                $scope.defined_master = false;
            }
        };

        $scope.addtoProcessReq = function (i, j, selected) {
            if (selected) {
                if (selected[1] && selected[1].to_string) {
                    $scope.processrequirements[i][j].name = selected[1].to_string;
                } else {
                    if (!selected.name)
                        $scope.processrequirements[i][j].name = selected;
                    else
                        $scope.processrequirements[i][j].name = selected.name;
                }
                if ($scope.processrequirements[i][1].name) {
                    $scope.processrequirements[i][0].to_string = $scope.processrequirements[i][1].name + ', ';
                } else {
                    $scope.processrequirements[i][0].to_string = '';
                }

                $scope.processrequirements[i][0].to_string += $scope.processrequirements[i][2].name + ' ' + $scope.processrequirements[i][3].name + ' ' + $scope.processrequirements[i][4].name + ' ' + $scope.processrequirements[i][5].name;

                $scope.processrequirements[i][0].to_string = $scope.processrequirements[i][0].to_string.trim();
                $scope.processrequirements[i][0].to_string = titleCase($scope.processrequirements[i][0].to_string + '.');

            }
        };
        // END ProcessMASTER


        // All Conditions

        // Condition
        $scope.condition_terms = [
            {
                name: 'If',
            },
            {
                name: 'As soon as',
            },
            {
                name: 'As long as',
            }
        ];

        $scope.newCondition = function () {
            $scope.conditions.push([{
                    id: 'Condition-' + ($scope.conditions.length + 1)
            }, {
                    to_string: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.removeCondition = function (i) {
            $scope.conditions.splice(i, 1);

            if ($scope.functionalrequirements.length === 0 && $scope.propertyrequirements.length === 0 && $scope.environmentrequirements.length === 0 && $scope.processrequirements.length === 0 && $scope.conditions.length === 0) {
                $scope.defined_master = false;
            }
        };

        $scope.addtoCondition = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.conditions[i][j].name = selected;
                else
                    $scope.conditions[i][j].name = selected.name;

                $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ' + $scope.conditions[i][3].name;
                $scope.conditions[i][1].to_string = $scope.conditions[i][1].to_string.trim();
                $scope.conditions[i][1].to_string = titleCase($scope.conditions[i][1].to_string);

            }
        };
        // END Condition



        // LogicMaster
        $scope.logic_terms1 = [
            {
                name: '<compared object>',
            },
            {
                name: '<system>',
            },
            {
                name: '<actor>',
            }
        ];
        $scope.logic_terms2 = [
            {
                name: '<object>',
            },
            {
                name: 'the function <function>',
            }
        ];

        $scope.newLogic = function () {
            $scope.conditions.push([{
                    id: 'Condition-' + ($scope.conditions.length + 1) + '-Logic'
            }, {
                    to_string: 'If'
            }, {
                    name: 'If'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'is'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'the function'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.addtoLogic = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.conditions[i][j].name = selected;
                else
                    $scope.conditions[i][j].name = selected.name;


                $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ';
                switch ($scope.conditions[i][3].name) {
                case '<compared object>':
                    $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ' + $scope.conditions[i][4].name + ' ' + $scope.conditions[i][5].name + ' ' + $scope.conditions[i][6].name + ' ' + $scope.conditions[i][7].name;
                    break;
                case '<system>':
                    $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ' + $scope.conditions[i][9].name + ' ' + $scope.conditions[i][11].name;
                    break;
                case '<actor>':
                    $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ' + $scope.conditions[i][10].name + ' ' + $scope.conditions[i][11].name;
                }
                switch ($scope.conditions[i][12].name) {
                case '<object>':
                    $scope.conditions[i][1].to_string += ' ' + $scope.conditions[i][13].name;
                    break;
                case 'the function <function>':
                    $scope.conditions[i][1].to_string += ' ' + $scope.conditions[i][14].name + ' ' + $scope.conditions[i][15].name;
                }
                $scope.conditions[i][1].to_string = $scope.conditions[i][1].to_string.trim();
                $scope.conditions[i][1].to_string = titleCase($scope.conditions[i][1].to_string);

            }
        };
        // END LogicMaster


        // EventMaster
        $scope.event_terms = [
            {
                name: 'the event <event>',
            },
            {
                name: '<actor>',
            },
            {
                name: '<system>',
            }
        ];

        $scope.newEvent = function () {
            $scope.conditions.push([{
                    id: 'Condition-' + ($scope.conditions.length + 1) + '-Event'
            }, {
                    to_string: 'As soon as'
            }, {
                    name: 'As soon as'
            }, {
                    name: ''
            }, {
                    name: 'the event'
            }, {
                    name: ''
            }, {
                    name: 'happens'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'the function'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.addtoEvent = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.conditions[i][j].name = selected;
                else
                    $scope.conditions[i][j].name = selected.name;

                $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ';
                switch ($scope.conditions[i][3].name) {
                case 'the event <event>':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][4].name + ' ' + $scope.conditions[i][5].name + ' ' + $scope.conditions[i][6].name;
                    break;
                case '<actor>':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][7].name + ' ';
                    break;
                case '<system>':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][8].name + ' ';
                }
                if ($scope.conditions[i][3].name == '<actor>' || $scope.conditions[i][3].name == '<system>') {
                    $scope.conditions[i][1].to_string += $scope.conditions[i][9].name + ' ';
                    switch ($scope.conditions[i][10].name) {
                    case '<object>':
                        $scope.conditions[i][1].to_string += $scope.conditions[i][11].name;
                        break;
                    case 'the function <function>':
                        $scope.conditions[i][1].to_string += $scope.conditions[i][12].name + ' ' + $scope.conditions[i][13].name;
                    }
                }
                $scope.conditions[i][1].to_string = $scope.conditions[i][1].to_string.trim();
                $scope.conditions[i][1].to_string = titleCase($scope.conditions[i][1].to_string);

            }
        };
        // END EventMaster


        // TimeMaster

        $scope.time_terms1 = [
            {
                name: 'the/an <object>',
            }, {
                name: '<system> is',
            }, {
                name: '<actor>',
            }, {
                name: '<system>',
            }
        ];

        $scope.time_terms2 = [
            {
                name: 'the',
            }, {
                name: 'an',
            }
        ];

        $scope.newTime = function () {
            $scope.conditions.push([{
                    id: 'Condition-' + ($scope.conditions.length + 1) + '-Time'
            }, {
                    to_string: 'As long as'
            }, {
                    name: 'As long as'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'is'
            }, {
                    name: 'in the state'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'the function'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_master) $scope.defined_master = true;
        };

        $scope.addtoTime = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.conditions[i][j].name = selected;
                else
                    $scope.conditions[i][j].name = selected.name;


                $scope.conditions[i][1].to_string = $scope.conditions[i][2].name + ' ';

                switch ($scope.conditions[i][3].name) {
                case 'the/an <object>':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][4].name + ' ' + $scope.conditions[i][5].name + ' ';
                    break;
                case '<system> is':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][6].name + ' ';
                    break;
                case '<actor>':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][10].name + ' ' + $scope.conditions[i][11].name + ' ';
                    switch ($scope.conditions[i][12].name) {
                    case 'the function <function>':
                        $scope.conditions[i][1].to_string += $scope.conditions[i][13].name + ' ' + $scope.conditions[i][14].name;
                        break;
                    case '<object>':
                        $scope.conditions[i][1].to_string += $scope.conditions[i][15].name;
                    }
                    break;
                case '<system>':
                    $scope.conditions[i][1].to_string += $scope.conditions[i][16].name + ' ' + $scope.conditions[i][17].name + ' ' + $scope.conditions[i][18].name;

                }

                if ($scope.conditions[i][3].name == 'the/an <object>' || $scope.conditions[i][3].name == '<system> is') {
                    $scope.conditions[i][1].to_string += $scope.conditions[i][7].name + ' ' + $scope.conditions[i][8].name + ' ' + $scope.conditions[i][9].name;
                }
                $scope.conditions[i][1].to_string = $scope.conditions[i][1].to_string.trim();
                $scope.conditions[i][1].to_string = titleCase($scope.conditions[i][1].to_string);

            }
        };
        // END TimeMaster



        //
        // EARS functions Section
        //


        // Ubiquitous requirements
        $scope.newUbiquitousReq = function () {
            $scope.ubiquitousrequirements.push([{
                    to_string: ''
            }, {
                    name: 'The'
            }, {
                    name: ''
            }, {
                    name: 'shall'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_ears) {
                $scope.defined_ears = true;
            }
        };

        $scope.removeUbiquitousReq = function (i) {
            $scope.ubiquitousrequirements.splice(i, 1);

            if ($scope.ubiquitousrequirements.length === 0 && $scope.eventrequirements.length === 0 && $scope.unwantedrequirements.length === 0 && $scope.staterequirements.length === 0 && $scope.optionalrequirements.length === 0 && $scope.complexrequirements.length === 0) {
                $scope.defined_ears = false;
            }
        };

        $scope.addtoUbiquitousReq = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.ubiquitousrequirements[i][j].name = selected;
                else
                    $scope.ubiquitousrequirements[i][j].name = selected.name;

                $scope.ubiquitousrequirements[i][0].to_string = $scope.ubiquitousrequirements[i][1].name + ' ' + $scope.ubiquitousrequirements[i][2].name + ' ' + $scope.ubiquitousrequirements[i][3].name + ' ' + $scope.ubiquitousrequirements[i][4].name + '.';

                $scope.ubiquitousrequirements[i][0].to_string = titleCase($scope.ubiquitousrequirements[i][0].to_string);

            }
        };
        // END Ubiquitous


        // Event-driven requirements
        $scope.newEventReq = function () {
            $scope.eventrequirements.push([{
                    to_string: ''
            }, {
                    name: 'When'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'the'
            }, {
                    name: ''
            }, {
                    name: 'shall'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_ears) {
                $scope.defined_ears = true;
            }
        };

        $scope.removeEventReq = function (i) {
            $scope.eventrequirements.splice(i, 1);

            if ($scope.ubiquitousrequirements.length === 0 && $scope.eventrequirements.length === 0 && $scope.unwantedrequirements.length === 0 && $scope.staterequirements.length === 0 && $scope.optionalrequirements.length === 0 && $scope.complexrequirements.length === 0) {
                $scope.defined_ears = false;
            }
        };

        $scope.addtoEventReq = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.eventrequirements[i][j].name = selected;
                else
                    $scope.eventrequirements[i][j].name = selected.name;

                $scope.eventrequirements[i][0].to_string = $scope.eventrequirements[i][1].name + ' ';

                if ($scope.eventrequirements[i][2].name) {
                    $scope.eventrequirements[i][0].to_string += $scope.eventrequirements[i][2].name + ' ';
                }

                $scope.eventrequirements[i][0].to_string += $scope.eventrequirements[i][3].name + ', ';

                $scope.eventrequirements[i][0].to_string += $scope.eventrequirements[i][4].name + ' ' + $scope.eventrequirements[i][5].name + ' ' + $scope.eventrequirements[i][6].name + ' ' + $scope.eventrequirements[i][7].name + '.';

                $scope.eventrequirements[i][0].to_string = titleCase($scope.eventrequirements[i][0].to_string);

            }
        };
        // END Event-driven



        // Unwanted behaviours
        $scope.newUnwantedReq = function () {
            $scope.unwantedrequirements.push([{
                    to_string: ''
            }, {
                    name: 'If'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'then'
            }, {
                    name: 'the'
            }, {
                    name: ''
            }, {
                    name: 'shall'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_ears) {
                $scope.defined_ears = true;
            }
        };

        $scope.removeUnwantedReq = function (i) {
            $scope.unwantedrequirements.splice(i, 1);

            if ($scope.ubiquitousrequirements.length === 0 && $scope.eventrequirements.length === 0 && $scope.unwantedrequirements.length === 0 && $scope.staterequirements.length === 0 && $scope.optionalrequirements.length === 0 && $scope.complexrequirements.length === 0) {
                $scope.defined_ears = false;
            }
        };

        $scope.addtoUnwantedReq = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.unwantedrequirements[i][j].name = selected;
                else
                    $scope.unwantedrequirements[i][j].name = selected.name;

                $scope.unwantedrequirements[i][0].to_string = $scope.unwantedrequirements[i][1].name + ' ';

                if ($scope.unwantedrequirements[i][2].name) {
                    $scope.unwantedrequirements[i][0].to_string += $scope.unwantedrequirements[i][2].name + ' ';
                }

                $scope.unwantedrequirements[i][0].to_string += $scope.unwantedrequirements[i][3].name + ', ' + $scope.unwantedrequirements[i][4].name + ' ';

                $scope.unwantedrequirements[i][0].to_string += $scope.unwantedrequirements[i][5].name + ' ' + $scope.unwantedrequirements[i][6].name + ' ' + $scope.unwantedrequirements[i][7].name + ' ' + $scope.unwantedrequirements[i][8].name + '.';

                $scope.unwantedrequirements[i][0].to_string = titleCase($scope.unwantedrequirements[i][0].to_string);

            }
        };
        // END Unwanted behaviours


        // State-driven requirements
        $scope.newStateReq = function () {
            $scope.staterequirements.push([{
                    to_string: ''
            }, {
                    name: 'While'
            }, {
                    name: ''
            }, {
                    name: 'the'
            }, {
                    name: ''
            }, {
                    name: 'shall'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_ears) {
                $scope.defined_ears = true;
            }
        };

        $scope.removeStateReq = function (i) {
            $scope.staterequirements.splice(i, 1);

            if ($scope.ubiquitousrequirements.length === 0 && $scope.eventrequirements.length === 0 && $scope.unwantedrequirements.length === 0 && $scope.staterequirements.length === 0 && $scope.optionalrequirements.length === 0 && $scope.complexrequirements.length === 0) {
                $scope.defined_ears = false;
            }
        };

        $scope.addtoStateReq = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.staterequirements[i][j].name = selected;
                else
                    $scope.staterequirements[i][j].name = selected.name;

                $scope.staterequirements[i][0].to_string = $scope.staterequirements[i][1].name + ' ' + $scope.staterequirements[i][2].name + ', ';

                $scope.staterequirements[i][0].to_string += $scope.staterequirements[i][3].name + ' ' + $scope.staterequirements[i][4].name + ' ' + $scope.staterequirements[i][5].name + ' ' + $scope.staterequirements[i][6].name + '.';

                $scope.staterequirements[i][0].to_string = titleCase($scope.staterequirements[i][0].to_string);

            }
        };
        // END State-driven requirements


        // Optional features
        $scope.newOptionalReq = function () {
            $scope.optionalrequirements.push([{
                    to_string: ''
            }, {
                    name: 'Where'
            }, {
                    name: ''
            }, {
                    name: 'the'
            }, {
                    name: ''
            }, {
                    name: 'shall'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_ears) {
                $scope.defined_ears = true;
            }
        };

        $scope.removeOptionalReq = function (i) {
            $scope.optionalrequirements.splice(i, 1);

            if ($scope.ubiquitousrequirements.length === 0 && $scope.eventrequirements.length === 0 && $scope.unwantedrequirements.length === 0 && $scope.staterequirements.length === 0 && $scope.optionalrequirements.length === 0 && $scope.complexrequirements.length === 0) {
                $scope.defined_ears = false;
            }
        };

        $scope.addtoOptionalReq = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.optionalrequirements[i][j].name = selected;
                else
                    $scope.optionalrequirements[i][j].name = selected.name;

                $scope.optionalrequirements[i][0].to_string = $scope.optionalrequirements[i][1].name + ' ' + $scope.optionalrequirements[i][2].name + ', ';

                $scope.optionalrequirements[i][1].to_string = titleLowerCase($scope.optionalrequirements[i][0].to_string);

                $scope.optionalrequirements[i][0].to_string += $scope.optionalrequirements[i][3].name + ' ' + $scope.optionalrequirements[i][4].name + ' ' + $scope.optionalrequirements[i][5].name + ' ' + $scope.optionalrequirements[i][6].name + '.';

                $scope.optionalrequirements[i][0].to_string = titleCase($scope.optionalrequirements[i][0].to_string);

            }
        };
        // END Optional features


        // Complex requirements
        $scope.newComplexReq = function () {
            $scope.complexrequirements.push([{
                    to_string: ''
            }, {
                    name: 'When'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'while'
            }, {
                    name: ''
            }, {
                    name: 'where'
            }, {
                    name: ''
            }, {
                    name: 'if'
            }, {
                    name: ''
            }, {
                    name: ''
            }, {
                    name: 'then'
            }, {
                    name: 'the'
            }, {
                    name: ''
            }, {
                    name: 'shall'
            }, {
                    name: ''
            }
            ]);
            if (!$scope.defined_ears) {
                $scope.defined_ears = true;
            }
        };

        $scope.removeComplexReq = function (i) {
            $scope.complexrequirements.splice(i, 1);

            if ($scope.ubiquitousrequirements.length === 0 && $scope.eventrequirements.length === 0 && $scope.unwantedrequirements.length === 0 && $scope.staterequirements.length === 0 && $scope.complexrequirement.length === 0 && $scope.complexrequirement.length === 0) {
                $scope.defined_ears = false;
            }
        };

        $scope.addtoComplexReq = function (i, j, selected) {
            if (selected) {
                if (!selected.name)
                    $scope.complexrequirements[i][j].name = selected;
                else
                    $scope.complexrequirements[i][j].name = selected.name;

                $scope.complexrequirements[i][0].to_string = '';

                if ($scope.complexrequirements[i][2].name || $scope.complexrequirements[i][3].name) {
                    $scope.complexrequirements[i][0].to_string += $scope.complexrequirements[i][1].name + ' ' + $scope.complexrequirements[i][2].name + ' ' + $scope.complexrequirements[i][3].name + ', ';
                }

                if ($scope.complexrequirements[i][5].name) {
                    $scope.complexrequirements[i][0].to_string += $scope.complexrequirements[i][4].name + ' ' + $scope.complexrequirements[i][5].name + ', ';
                }

                if ($scope.complexrequirements[i][7].name) {
                    $scope.complexrequirements[i][0].to_string += $scope.complexrequirements[i][6].name + ' ' + $scope.complexrequirements[i][7].name + ', ';
                }

                if ($scope.complexrequirements[i][9].name || $scope.complexrequirements[i][10].name) {
                    $scope.complexrequirements[i][0].to_string += $scope.complexrequirements[i][8].name + ' ' + $scope.complexrequirements[i][9].name + ' ' + $scope.complexrequirements[i][10].name + ' ' + $scope.complexrequirements[i][11].name + ', ';
                }

                $scope.complexrequirements[i][0].to_string += ' ' + $scope.complexrequirements[i][12].name + ' ' + $scope.complexrequirements[i][13].name + ' ' + $scope.complexrequirements[i][14].name + ' ' + $scope.complexrequirements[i][15].name + '.';

                $scope.complexrequirements[i][0].to_string = titleCase($scope.complexrequirements[i][0].to_string);

            }
        };
        // END Complex requirements

}]);