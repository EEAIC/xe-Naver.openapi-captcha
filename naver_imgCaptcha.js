/* procFilter 함수를 가로채서 captcha 이미지 및 폼을 출력 */
var calledArgs = null;
(function($){
	$(function() {
		var captchaXE = {
            html : null,

            show :  function(ret_obj) {
                if (!captchaXE.html) {
                    captchaXE.html = $(ret_obj.view);
                    captchaXE.html.appendTo(document.body);
                }

                $('.naver_captcha-dialog').show();
                $('#captcha_image').attr("src", current_url.setQuery('captcha_action','captchaImage').setQuery('rnd', (new Date).getTime()));
                $(captchaXE.html).append('<input type="hidden" name="error_return_url" value="'+current_url+'" />');
                
                captchaXE.html.find('button#reload')
                .click(function(){					
                    $("#captcha_image").attr("src", current_url.setQuery('captcha_action','captchaImage').setQuery('rnd', (new Date).getTime()));												
                });

                $('#captcha_layer form')
                .submit(function(e){
                    e.preventDefault();
                    if(!$('#captcha_value').val()){
                        $(this).find('input[type=text]').val('').focus();
                        return false;
                    }
                    captchaXE.compare(); return false;
                });
             
                
            },

            compare : function(e) {
                var params = new Array();
                params['captcha_action'] = 'captchaCompare';
                params['mid'] = current_mid;
                params['captcha_value'] = $('#captcha_value').val();
                
                window.oldExecXml(calledArgs.module,calledArgs.act,params, function(response) {
                    var isEqual = parseInt(response.result)
                    if (isEqual) {
						$("#captcha_layer").hide();
						window.oldExecXml(calledArgs.module, calledArgs.act, calledArgs.params, calledArgs.callback_func, calledArgs.response_tags, calledArgs.callback_func_arg, calledArgs.fo_obj);
					} else {
                        $('#captcha_image').attr("src", current_url.setQuery('captcha_action','captchaImage').setQuery('rnd', (new Date).getTime()));
                        $('#captcah_alert').html(response.message).show().fadeOut(2000);
						$('#captcha_value').select();
					}
                }, new Array('result', 'message'));
          
            },

            exec : function(module, act, params, callback_func, response_tags, callback_func_arg, fo_obj) {
                var doCheck = false;

                $.each(captchaTargetAct || {}, function(key,val){ if (val == act){ doCheck = true; return false; } });

                if (doCheck) { /* captcha 를 사용하는 경우 */
                    if (!captchaXE.html){                       
                        calledArgs = {'module':module,'act':act,'params':params,'callback_func':callback_func,'response_tags':response_tags,'callback_func_arg':callback_func_arg,'fo_obj':fo_obj};
                        var params = new Array();
                        params['captcha_action'] = 'getHtml';
                        params['mid'] = current_mid;
                        window.oldExecXml(module, act, params, captchaXE.show, new Array('view', 'key'));

                    } else {
                        captchaXE.show();
                    }
                   
                } else {
                    window.oldExecXml(module, act, params, callback_func, response_tags, callback_func_arg, fo_obj);
                }
                return true;
            }
		};
		
		function xeCaptcha() {
			captchaXE.exec; 
            return captchaXE;
		}

		$(window).ready(function(){
			if(!window.oldExecXml) {
				window.oldExecXml = window.exec_xml;
				window.exec_xml = xeCaptcha().exec;
			}
		});
	});
})(jQuery);
