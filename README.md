# followproject
Really bad follow project. 

<br><br>
<br><br>

<br><br>
<br><br>

<br><br>
<br><br>

<br><br>
<br><br>

<br><br>
<br><br>

<br><br>
<br><br>


You shouldn't use this....



<br><br>
<br><br>

<br><br>
<br><br>


<br><br>
<br><br>

<br><br>
<br><br>


<br><br>
<br><br>

<br><br>
<br><br>


Use at own risk

Tested on casperjs 1.1 and phantomjs 2.0

## follow2.js


```
casperjs follow2.js yourusername yourpassword test.json
```

test.json
```javascript
["targetusername","targetusername/repositoryname"]
```

When you input the parameters. phantomjs will login to github. Then it goes through every string in test.json's follower page and follows everyone there. In this example,targetusername's followers will be followed. Also, it will follow users in repositories at targetusername/repositoryname. At the end of the script, it will save the followed usernames in tmptest.json.


## orgfollow2.js

Same as follow2.js except it follows organizations instead of people.

test.json
```javascript
["organization0","organization1"]
```
