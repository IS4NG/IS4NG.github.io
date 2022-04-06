
$('.delete').click(function(e){
        let 글번호 =  e.target.dataset.id;
        let 삭제할거 = $(this);
        $.ajax({
        method: 'DELETE',
        url: '/delete',
        data: {_id : 글번호}
        }).done(function(결과){
        //location.reload는 새로고침
        삭제할거.parent('li').fadeOut();
        location.reload();
        }).fail(function(xhr, textStatus, errorThrown){
        alert('로그인하세요!');
        });
        })
