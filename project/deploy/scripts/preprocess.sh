#!/bin/sh

#UPDATE VERSION INFO FOR REST RUNTIME
echo "UPDATE VERSION INFO"
sed -ie "s@<BUILDTAG>@$BUILD_TAG@g" $WORKSPACE/ins_common/src/main/java/org/scg/common/Properties.java
sed -ie "s@<BUILDDATE>@`date`@g" $WORKSPACE/ins_common/src/main/java/org/scg/common/Properties.java
sed -ie "s@<RELEASEVERSION>@preview@g" $WORKSPACE/ins_common/src/main/java/org/scg/common/Properties.java
sed -ie "s@<ENVIRONMENT>@PRODUCTION@g" $WORKSPACE/ins_common/src/main/java/org/scg/common/Properties.java

sed -ie "s@<BUILDTAG>@$BUILD_TAG@g" $WORKSPACE/ins_proxy/src/config/config.json
sed -ie "s@<BUILDDATE>@`date`@g" $WORKSPACE/ins_proxy/src/config/config.json
sed -ie "s@<RELEASEVERSION>@preview@g" $WORKSPACE/ins_proxy/src/config/config.json
sed -ie "s@<ENVIRONMENT>@PRODUCTION@g" $WORKSPACE/ins_proxy/src/config/config.json
