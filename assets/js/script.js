
var isDetectLang = true;
var sourceLang = 'ko';
var targetLang = 'en';

function callTranslator() {
    var query = $('#query').val().replaceAll('\n', '%0A');
    var queryKakao = $('#query').val().replaceAll('\n', '%20');
    console.log(query);

    if (query.length > 0) { //빈칸 확인
        if (query.length < 1000) {

            if (isDetectLang) { //언어 감지
                $.ajax({
                    url: 'https://translator-api.vercel.app/detectLangs?text=' + query,
                    type: 'GET',
                    success: function (res) {
                        sourceLang = res.langCode;
                        $('#autoLang').text('언어감지(' + sourceLang.replace('ko', '한국어').replace('en', '영어').replace('ja', '일본어') + ')');
                        papagoApi(query);
                        kakaoTranslate(queryKakao);
                    }
                });
            } else { ///사용자가 언어 지정함
                papagoApi(query);
                kakaoTranslate(queryKakao);
            }

        } else { //글자수 초과
            $('#result_translation').html('글자수는 1000자 이하로 입력해주세요.');
            $('#result_translation_kakao').html('글자수는 1000자 이하로 입력해주세요.');
            $('#autoLang').text('언어감지');
        }

    } else {
        $('#result_translation').text('');
        $('#result_translation_kakao').text('')
        $('#autoLang').text('언어감지');
    }
    $('#result_translation').height(1).height($('#result_translation').prop('scrollHeight'));
    return true;
}

function reTranslator() {
    var query = $('#result_translation').val().replaceAll('\n', '%0A');
    console.log(query);
    if (query.length > 0) { //빈칸 확인
        if (query.length < 1000) {
            //ajaax
            $.ajax({
                url: 'https://translator-api.vercel.app/papago?source=' + targetLang + '&target=' + sourceLang + '&text=' + query,
                type: 'GET',
                success: function (res) {
                    $('#reverse_result').html(res.message.result.translatedText.toString().replaceAll('\\r\\n', '<br>').replaceAll('\n', '<br>'));
                }
            });
        } else { //글자수 초과
            $('#reverse_result').html('번역 결과가 너무 길어요.');
        }

    } else {
        $('#reverse_result').text('')
    }
    return true;
}

function papagoApi(query) {
    if ((sourceLang == targetLang) && targetLang == 'ko') {
        targetLang = 'en';
        $('#target-lang h3').removeClass('active');
        $('#target-lang #en').addClass('active');
    } else if ((sourceLang == targetLang) && targetLang == 'en') {
        targetLang = 'ko';
        $('#target-lang h3').removeClass('active');
        $('#target-lang #ko').addClass('active');
    }
    $.ajax({
        url: 'https://translator-api.vercel.app/papago?source=' + sourceLang + '&target=' + targetLang + '&text=' + query,
        type: 'GET',
        success: function (res) {
            $('#result_translation').html(res.message.result.translatedText.toString().replaceAll('\\r\\n', '<br>').replaceAll('\n', '<br>'));
            reTranslator();
        }
    });
}

function kakaoTranslate(str) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            url: "https://dapi.kakao.com/v2/translation/translate?src_lang=" + sourceLang.replace('ko', 'kr') + "&target_lang=" + targetLang.replace('ko', 'kr') + "&query=" + str,
            dataType: 'json',
            headers: { "Authorization": "KakaoAK 9c593e2ec73a545b0cd0d67a61a8e599" },
            data: '{}',
            success: function (data) {
                resolve(data.translated_text[0][0]);
                $('#result_translation_kakao').html(data.translated_text[0][0]);
                reTranslatorKakao();
                $('#result_translation_kakao').height(1).height($('#result_translation_kakao').prop('scrollHeight'));

            },
            error: function (xhr, ajaxOptions, throwError) {
                reject(throwError);
                console.log(throwError);
            }
        });
    });
}

function reTranslatorKakao() {
    var str = $('#result_translation_kakao').val().replace('\n', '%0A');
    if (str.length > 0) { //빈칸 확인
        if (str.length < 1000) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "GET",
                    url: "https://dapi.kakao.com/v2/translation/translate?src_lang=" + targetLang.replace('ko', 'kr') + "&target_lang=" + sourceLang.replace('ko', 'kr') + "&query=" + str,
                    dataType: 'json',
                    headers: { "Authorization": "KakaoAK 9c593e2ec73a545b0cd0d67a61a8e599" },
                    data: '{}',
                    success: function (data) {
                        resolve(data.translated_text[0][0]);
                        $('#reverse_result_kakao').html((data.translated_text[0][0]).replaceAll('\n', '<br>'));
                    },
                    error: function (xhr, ajaxOptions, throwError) {
                        reject(throwError);
                        console.log(throwError);
                    }
                });
            });
        } else { //글자수 초과
            $('#reverse_result_kakao').html('번역 결과가 너무 길어요.');
        }

    } else {
        $('#reverse_result_kakao').text('')
    }

}