# alpine-huts

Trying to bring all the alpine huts into one usefull place.


Query for overpass:

    [out:json][timeout:25];
    // gather results
    (
      // query part for: “tourism=alpine_hut”
      node["tourism"="alpine_hut"]({{bbox}});
      way["tourism"="alpine_hut"]({{bbox}});
      relation["tourism"="alpine_hut"]({{bbox}});
    );
    // print results
    out tags center;
    >;


