$(function(){

	$('#signup_link, #edit_link').on('click',function(event){
		event.preventDefault();
		$('.signup_form_container').slideToggle();
		$('.login_form_container').hide();
	});

	$('.update_button').on('click',function(e){
		e.preventDefault();
		$.ajax({
			url:'/update',
			type:'POST',
			data:'edit_user_name='+$('#edit_user_name').val()+'&edit_user_password='+$('#edit_user_password').val()+'&edit_user_email='+$('#edit_user_email').val()+'&edit_user_mobile='+$('#edit_user_mobile').val()+'&user_email_hidden='+$('#user_email_hidden').val(),
			dataType:'text',
			success: function(result){
				console.log(result);
				if(result){
					$('.signup_form_container').slideToggle();
					$('#profile_name').text($('#edit_user_name').val());
				}
			}
		});		
	});

});