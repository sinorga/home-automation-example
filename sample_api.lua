# PUT /user/{email}
--
local ret = User.createUser({
  email = request.parameters.email,
  name = request.parameters.email,
  password = request.body.password
})
if ret.status_code ~= nil then
  response.code = ret.status_code
  response.message = ret.message
else
  local domain = string.gsub(request.uri, '(https?://.-/)(.*)', '%1')
  local text = "Hi " .. request.parameters.email .. ",\n"
  text = text .. "Click this link to verify your account:\n"
  text = text .. domain .. "verify/" .. ret;
  Email.send({
    from = 'mail@exosite.com',
    to = request.parameters.email,
    subject = ("Signup on " .. domain),
    text = text
  })
  return 'Ok'
end
##MARK##
# GET /verify/{code}
--
local ret = User.activateUser({code = request.parameters.code})
if ret ~= nil and ret.status_code ~= nil then
  response.code = ret.status_code
  response.message = ret.message
else
  return 'Ok'
end
##MARK##
# PATCH /user/{email}
key = Object.keys(body)[0];
return users.getMe(token).then(function(obj) {
    return users.getUserStorage(obj.id, key).then(function(){
         return users.updateUserStorage(obj.id, body);
    }).catch(function(){
         return users.createUserStorage(obj.id, body);
    });
});
##MARK##
# POST /session
--
local ret = User.getUserToken({
  email = request.body.email,
  password = request.body.password
})
if ret ~= nil and ret.status_code ~= nil then
  response.code = ret.status_code
  response.message = ret.message
else
  response.headers = {
    ["Set-Cookie"] = "sid=" .. tostring(ret)
  }
  response.message = {["token"] = ret}
end
##MARK##
# GET /session
--
local _, _, sid = string.find(request.headers.cookie, "sid=([^;]+)")
local user = User.getCurrentUser({Authorization = "Bearer "..sid})
if user ~= nil and user.id ~= nil then
    return {["token"] = sid}
end
response.code = 400
response.message = "Session invalid"
##MARK##
# POST /user/{email}/lightbulbs
--
local _, _, sid = string.find(request.headers.cookie, "sid=([^;]+)")
local sn = request.body.serialnumber;
local link = request.body.link;
local user = User.getCurrentUser({Authorization = "Bearer "..sid})

if user == nil or user.id == nil then
  response.message = "Permission Denied"
  response.code = 304
end

local owners = User.listRoleUsers({role_id = "full", parameter = sn})

if link ~= nil then
  if #owners == 0 then
    local resp = User.assignUser({
      id = user.id, 
      roles = {{role_id = "full", parameter = sn}}
    })
    return {"assignUser", resp}
  else
    response.message = "Conflict"
    response.code = 409
    return
  end
else
  local is_owner = false
  for i, owner_id in ipairs(owners) do
    if owner_id == user.id then
      is_owner = true
      break
    end
  end
  if is_owner == false then
    response.message = "Conflict"
    response.code = 409
    return
  else
    local guests = User.listRoleUsers({role_id = "readonly", parameter = sn})
    for i, guest in ipairs(guests) do
      User.deassignUserParam({id = guest, role_id = "readonly", parameter = sn})
    end
    User.deassignUserParam({id = user.id, role_id = "full", parameter = sn})
  end
end
##MARK##
# GET /user/{email}/lightbulbs
var dataports = ['state', 'temperature', 'hours'];
var user_id;
return users.getMe(token).then(function(me) {
    user_id = me.id;
    return users.getAssignedRoles(user_id);
}).then(function(roles) {
    var list = [];
    var results = [];
    for (var i = 0; i < roles.length; i++) {
        if (!roles[i].parameter) continue;
        var obj = {
            'serialnumber': roles[i].parameter,
            'type': roles[i].role_id,
        }
        for (var j = 0; j < dataports.length; j++) {
            obj[dataports[j]] =  devices('$PRODUCT_ID').read(roles[i].parameter, dataports[j])
                .then(function(data) { return data.value; })
                .catch(function() {return null;});
        }
        list.push(promise.props(obj).then(function(result) {
            results.push(result);
        }));
    }
    return promise.all(list).then(function() {
        return results;
    });
});
##MARK##
# GET /user/{email}
return users.getMe(token).then(function(obj) {
    if (obj.email != parameters.email) {
        return respond(parameters.email, 403);
    } else {
        return users.getUserAllStorage(obj.id, token);
    }
});
##MARK##
# POST /user/{email}/shared/
var sn = body.serialnumber;
return users.getMe(token).then(function(me) {
    return users.checkUserRole(me.id, 'full', sn)
}).then(function(what) {
    return users.getUserByEmail(parameters.email)
}).then(function(user) {
    return users.assignUserParam(user.id, 'readonly', sn);
});
##MARK##
# DELETE /user/{email}/shared/{sn}
var sn = parameters.sn;
return users.getMe(token).then(function(me) {
    return users.checkUserRole(me.id, 'full', sn)
}).then(function(what) {
    return users.getUserByEmail(parameters.email)
}).then(function(user) {
    users.deassignUser(user.id, 'readonly');
    return users.deassignUserParam(user.id, 'readonly', sn);
});
##MARK##
# GET /user/{email}/shared/
return users.getMe(token).then(function(me) {
    if (me.email != parameters.email) {
        return respond('Permission denied', 403);
    } else {
        return users.getAssignedRoles(me.id);
    }
}).filter(function(role) {
    return role.parameter && role.role_id == 'full';
}).map(function(role) {
    return promise.props({
        'serialnumber': role.parameter,
        'email': users.getAssignedUsers('readonly', role.parameter).map(function(id) {
            return users.getUser(id)
        }).map(function(user) {
            return user.email;
        })
    });
}).all().then(function(sns) {
    var results = [];
    for (var i = 0; i < sns.length; i++) {
        var device = sns[i];
        for (var j = 0; j < device.email.length; j++) {
            results.push({
                'serialnumber': device.serialnumber,
                'type': 'readonly',
                'email': device.email[j]
            });
        }
    }
    return results;
});
##MARK##
# POST /lightbulb/{sn}
//users.checkUserRole(me, 'full', sn,
return devices('$PRODUCT_ID').write(parameters.sn, body.alias, body.value);
##MARK##
# GET /lightbulb/{sn}
var readval = function(sn, name) {
    return devices('$PRODUCT_ID').read(sn, name).then(function(data) {
        return data.value;
    }).catch(function() {
        return null;
    });
}
return promise.props({
    state: readval(parameters.sn, 'state'),
    hours: readval(parameters.sn, 'hours'),
    temperature: readval(parameters.sn, 'temp'),
});
