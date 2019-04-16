const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const colors = require('colors');
console.log(`


██╗███╗   ██╗███████╗████████╗    ██████╗ ██████╗  █████╗ ██████╗ ██████╗ ███████╗██████╗ 
██║████╗  ██║██╔════╝╚══██╔══╝   ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
██║██╔██╗ ██║███████╗   ██║█████╗██║  ███╗██████╔╝███████║██████╔╝██████╔╝█████╗  ██████╔╝
██║██║╚██╗██║╚════██║   ██║╚════╝██║   ██║██╔══██╗██╔══██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗
██║██║ ╚████║███████║   ██║      ╚██████╔╝██║  ██║██║  ██║██████╔╝██████╔╝███████╗██║  ██║
╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝       ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                                                          
                                                                        by un4
`.rainbow);

var arguname = process.argv[2]; // 
(async () => {

    const USERNAME = arguname;
    const BASE_URL = `https://www.instagram.com/${USERNAME}`;

    let response = await request(BASE_URL);

    let $ = cheerio.load(response);

    let script = $('script[type="text/javascript"]').eq(3).html();

    let script_regex = /window._sharedData = (.+);/g.exec(script);


    console.log(colors.red.underline("fetching..."+`${USERNAME} instagram data`));

    // console.log(ig_dat);
    let { entry_data: { ProfilePage: { [0]: { graphql: { user: { edge_owner_to_timeline_media: { edges } } } } } } } = JSON.parse(script_regex[1]);
    let posts = [];

    for (let edge of edges) {
        try {
            let { node } = edge;

            posts.push({
                id: node.id,
                shortcode: node.shortcode,
                timestamp: node.taken_at_timestamp,
                likes: node.edge_liked_by.count,
                comments: node.edge_media_to_comment.count,
                video_views: node.video_view_count,
                caption: node.edge_media_to_caption.edges[0].node.text,
                image_url: node.display_url
            });
            console.log(posts);
        } catch (err) {
            continue;
        }


    }
    let { entry_data: { ProfilePage: { [0]: { graphql: { user } } } } } = JSON.parse(script_regex[1]);

    let ig_dat = {

        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        uploads: user.edge_owner_to_timeline_media.count,
        fullname: user.full_name,
        picture_url: user.profile_pic_url_hd,
        posts
    }
    fs.writeFileSync(`${USERNAME}.json`, JSON.stringify(ig_dat));
    console.log(`file saved to ${USERNAME}.json`.green);
    debugger;

})()