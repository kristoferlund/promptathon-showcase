use crate::routes;
use router_library::router::{NodeType, RouteNode};

thread_local! {
    pub static ROUTES: RouteNode = {
        let mut root = RouteNode::new(NodeType::Static("".into()));
        root.insert("", routes::index::handler);
        root.insert("*", routes::__any::handler);
        root.insert("/app/:id", routes::app::id::handler);
        root
    };
}
