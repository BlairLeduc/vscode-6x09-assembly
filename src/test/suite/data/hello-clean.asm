	org	$3f00
* HELLO WORLD
screen	equ	$400
hello	ldy	#screen
	clra
hel010	sta	,y+
	cmpy	#screen+512
	bne	hel010
	ldx	#text
	ldy	#screen
hel020	lda	,x+
	beq	loop
	sta	,y+
	bra	hel020
loop	bra	loop
text	FCC	"HELLO, WORLD!"
	FCB	0
	END