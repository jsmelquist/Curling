/* Collision detection from Keith Peters, 'AS3: Making Things Move' */

var Bouncy = {};

Bouncy.bounce = -1.0; //friction

//boundries, set in script
Bouncy.boundries = {
	left: undefined,
	right: undefined,
	top: undefined,
	bottom: undefined
};

//check collision against boundries
//Todo: fix
Bouncy.check_walls = function (ball) {
	if(ball.x + ball.radius > Bouncy.boundries.right) {
		ball.modify({x: Bouncy.boundries.right - ball.radius,
					 vx: ball.vx * Bouncy.bounce});
		
	}else if(ball.x - ball.radius < Bouncy.boundries.left) {
		ball.modify({x: Bouncy.boundries.left + ball.radius,
					 vx: ball.vx * Bouncy.bounce});
	}
	if(ball.y + ball.radius > Bouncy.boundries.bottom) {
		ball.modify({y: Bouncy.boundries.bottom - ball.radius,
					 vy: ball.vy * Bouncy.bounce});
		
	}else if(ball.y - ball.radius < Bouncy.boundries.top) {
		ball.modify({y: Bouncy.boundries.top + ball.radius,
					 vy: ball.vy * Bouncy.bounce});
	}
};

Bouncy.rotate = function (x, y, sin, cos, reverse) {
	var point = {};
	if(reverse) {
		point.x = x * cos + y * sin;
		point.y = y * cos - x * sin;
	}else {
		point.x = x * cos - y * sin;
		point.y = y * cos + x * sin;
	}
	return point;
};

Bouncy.check_collision = function (ball_a, ball_b) {
	//calculate distance
	var dx = ball_b.x - ball_a.x;
	var dy = ball_b.y - ball_a.y;
	var dist = Math.sqrt(dx*dx + dy*dy);
	
	//it's a hit!
	if(dist < ball_a.radius + ball_b.radius) {
		
		Bouncy.collisionReaction( ball_a, ball_b );
	}
};

// VARIABLE SHAPE EXTENSION :
// Library extention for non-ball like objects

Bouncy.check_object_collision = function( shape_a, shape_b ) {
	var x_collision = false;
	var y_collision = false;
	
	//TODO: ball against polygon
	
	//polygons
	for( i = 0; i < shape_a.boundries.length; i++ ) {
		bound_a = shape_a.boundries[i];
		
		for( j = 0; j < shape_a.boundries.length; j++ ) {
			bound_b = shape_b.boundries[i];
			
			//check x
			if( bound_a.x < bound_a.x1 ) {
				if( bound_b.x > bound_a.x && bound_b.x1 < bound_a.x1 ) {
					x_collision = true;
				}
			}
			else {
				if( bound_b.x < bound_a.x && bound_b.x1 > bound_a.x1 ) {
					x_collision = true;
				}
			}
			
			//check y
			if( bound_a.y < bound_a.y1 ) {
				if( bound_b.y > bound_a.y && bound_b.y1 < bound_a.y1 ) {
					y_collision = true;
				}
			}
			else {
				if( bound_b.y < bound_a.y && bound_b.y1 > bound_a.y1 ) {
					y_collision = true;
				}
			}
			
			if( x_collision && y_collision ) {
			
				Bouncy.collisionReaction( shape_a, shape_b );
				return;
			}
			
			x_collision = false;
			y_collision = false;
		}
	}	
};

// Made Generic
Bouncy.collisionReaction = function( shape_a, shape_b) {
	var dx = shape_b.x - shape_a.x;
	var dy = shape_b.y - shape_a.y;
	
	var angle = Math.atan2(dy, dx);
	var sin = Math.sin(angle);
	var cos = Math.cos(angle);
	
	//rotate position
	var pos_a = {x:0, y:0};
	var pos_b = Bouncy.rotate(dx, dy, sin, cos, true);
	
	//rotate velocity
	var vel_a = Bouncy.rotate(shape_a.vx, shape_a.vy, sin, cos, true);
	var vel_b = Bouncy.rotate(shape_b.vx, shape_b.vy, sin, cos, true);
	
	//collision reaction
	var vx_total = vel_a.x - vel_b.x;
	vel_a.x = ((shape_a.mass - shape_b.mass) * vel_a.x +
			   2 * shape_b.mass * vel_b.x) /
		(shape_a.mass + shape_b.mass);
	vel_b.x = vx_total + vel_a.x;
	
	//update position
	var abs_v = Math.abs(vel_a.x) + Math.abs(vel_b.x);
	var overlap = (shape_a.radius + shape_b.radius)
		- Math.abs(pos_a.x - pos_b.x);
	pos_a.x += vel_a.x / abs_v * overlap;
	pos_b.y += vel_b.x / abs_v * overlap;
	
	//rotate back
	var pos_aF = Bouncy.rotate(pos_a.x, pos_a.y, sin, cos, false);
	var pos_bF = Bouncy.rotate(pos_b.x, pos_b.y, sin, cos, false);
	
	//adjust positions to screen
	shape_b.modify({x:shape_a.x + pos_bF.x,
				   y:shape_a.y + pos_bF.y});
	shape_a.modify({x:shape_a.x + pos_aF.x,
				   y:shape_a.y + pos_aF.y});
	
	//rotate velocities back
	var vel_aF = Bouncy.rotate(vel_a.x, vel_a.y, sin, cos, false);
	var vel_bF = Bouncy.rotate(vel_b.x, vel_b.y, sin, cos, false);
	
	shape_a.vx = vel_aF.x;
	shape_a.vy = vel_aF.y;
	shape_b.vx = vel_bF.x;
	shape_b.vy = vel_bF.y;
};