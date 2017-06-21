function Path(data) {
	var self = this;
	if (typeof data == "string") {
		data = JSON.parse(data);
	}
	self.points = data.points;
	if (self.points.length >= 2) {
		var path = new Path2D();
		var p = self.points;
		path.moveTo(p[0], p[1]);
		for (var i = 0; i < (p.length - 2)/6; ++i) {
			var b = 2 + 6*i;
			path.bezierCurveTo(p[b+0], p[b+1], p[b+2], p[b+3], p[b+4], p[b+5]);
		}
		self.path = path;
	}
	if (self.points.length >= 2) {
		var p = self.points;
		var l = p[0], r = p[0], d = p[1], u = p[1];
		for (var i = 0; i < p.length/2; ++i) {
			var x = p[2*i], y = p[2*i + 1];
			if (x < l) { l = x; }
			if (x > r) { r = x; }
			if (y < d) { d = y; }
			if (y > u) { u = y; }
		}
		self.bounds = [l, u, r, d];
	}
	
	self.stroke = data.stroke;
	self.fill = data.fill;

	self.draw = function(ctx, mod) {
		if (self.fill) {
			var f = self.fill;
			if (mod && mod.fill) {
				f = mod.fill(f);
			}
			var col = "rgba(";
			for (var i = 0; i < 3; ++i) { 
				col += Math.round(255*f[i]) + ",";
			}
			col += f[3] + ")";
			ctx.fillStyle = col;
			ctx.fill(self.path);
		}
		if (self.stroke) {
			if (self.stroke.color) { ctx.strokeStyle = self.stroke.color; }
			if (self.stroke.width) { ctx.lineWidth = self.stroke.width; }
			ctx.stroke(self.path);
		}
	};
}

function mulmv(m, v) {
	return [
		v[0]*m[0] + v[1]*m[1] + m[4],
		v[0]*m[2] + v[1]*m[3] + m[5]
	];
}

function mulimv(m, v) {
	var d = 1.0*(m[0]*m[3] - m[1]*m[2]);
	var im = [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d];
	var r = [v[0]-m[4],v[1]-m[5]];
	return [
		r[0]*im[0] + r[1]*im[1],
		r[0]*im[2] + r[1]*im[3]
	];
}

function Transformation() {
	var self = this;
	self.stack = [];
	self.accum = [1,0,0,1,0,0];
	self.update = function () {
		var m = [1,0,0,1,0,0];
		var ma = self.accum;
		for (var i = 0; i < self.stack.length; ++i) {
			var mi = self.stack[i];
			ma[0] = mi[0]*m[0] + mi[1]*m[2];
			ma[1] = mi[0]*m[1] + mi[1]*m[3];
			ma[2] = mi[2]*m[0] + mi[3]*m[2];
			ma[3] = mi[2]*m[1] + mi[3]*m[3];
			ma[4] = mi[0]*m[4] + mi[1]*m[5] + mi[4];
			ma[5] = mi[2]*m[4] + mi[3]*m[5] + mi[5];
			for (var j = 0; j < 6; ++j) {
				m[j] = ma[j];
			}
		}
	};
	self.push = function (m) {
		self.stack.push(m);
		self.update();
	};
	self.pop = function () {
		var m = self.stack.pop();
		self.update();
		return m;
	};
	self.size = function () {
		return self.stack.length;
	};
	self.apply = function (ctx) {
		var m = self.accum;
		ctx.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
	};
	self.forward = function (v) {
		return mulmv(self.accum, v);
	};
	self.backward = function (v) {
		return mulimv(self.accum, v);
	};
}
