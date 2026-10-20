package no.item.forms.mapper;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.function.Function;

public final class PortalRequestMapper
    implements MapSerializable
{
    private final PortalRequest request;

    private final Map<String, String> headers;

    /**
     * With a locale, the request is given as one that accepts only that language. The headers are
     * copied for it, since a copy of a request shares them with the request it was copied from.
     */
    public PortalRequestMapper( final PortalRequest request, final Locale locale )
    {
        this.request = request;

        if ( locale == null )
        {
            this.headers = request.getHeaders();
        }
        else
        {
            this.headers = new TreeMap<>( String.CASE_INSENSITIVE_ORDER );
            this.headers.putAll( request.getHeaders() );
            this.headers.put( "Accept-Language", locale.toLanguageTag() );
        }
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "method", this.request.getMethod() );
        gen.value( "scheme", this.request.getScheme() );
        gen.value( "host", this.request.getHost() );
        gen.value( "port", this.request.getPort() );
        gen.value( "path", this.request.getPath() );
        gen.value( "rawPath", this.request.getRawPath() );
        gen.value( "url", this.request.getUrl() );
        gen.value( "remoteAddress", this.request.getRemoteAddress() );
        gen.value( "mode", Objects.toString( this.request.getMode(), null ) );
        gen.value( "webSocket", this.request.isWebSocket() );

        if ( this.request.isValidTicket() != null )
        {
            gen.value( "validTicket", this.request.isValidTicket() );
        }

        if ( this.request.getRepositoryId() != null )
        {
            gen.value( "repositoryId", this.request.getRepositoryId().toString() );
        }

        if ( this.request.getBranch() != null )
        {
            gen.value( "branch", this.request.getBranch().getValue() );
        }

        if ( this.request.getContextPath() != null )
        {
            gen.value( "contextPath", this.request.getContextPath() );
        }

        serializeBody( gen );
        MapperHelper.serializeMultimap( "params", gen, this.request.getParams().asMap() );
        gen.value( "headers", this.headers );
        gen.value( "getHeader", (Function<String, String>) this.headers::get );
        gen.value( "cookies", this.request.getCookies() );
    }

    private void serializeBody( final MapGenerator gen )
    {
        if ( this.request.getContentType() == null )
        {
            return;
        }

        gen.value( "contentType", this.request.getContentType() );
        gen.value( "body", this.request.getBodyAsString() );
    }
}
